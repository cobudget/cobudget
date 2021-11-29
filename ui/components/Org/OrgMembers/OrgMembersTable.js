import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import ReactDOM from "react-dom";
import { useQuery, gql } from "urql";
import LoadMore from "../../LoadMore";

export const ORG_MEMBERS_QUERY = gql`
  query OrgMembers($orgSlug: String!, $offset: Int, $limit: Int) {
    orgMembersPage(orgSlug: $orgSlug, offset: $offset, limit: $limit) {
      moreExist
      orgMembers {
        id
        isOrgAdmin
        bio
        email
        user {
          id
          name
          username
          email
          verifiedEmail
          avatar
        }
      }
    }
  }
`;

const ActionsDropdown = ({
  updateOrgMember,
  //deleteMember,
  currentOrg,
  member,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            updateOrgMember({
              orgId: currentOrg.id,
              memberId: member.id,
              isOrgAdmin: !member.isOrgAdmin,
            }).then(() => {
              handleClose();
            });
          }}
        >
          {member.isOrgAdmin ? "Remove admin" : "Make admin"}
        </MenuItem>
        {/* how to also remove the user's event memberships when their org
            membership is removed?
        <MenuItem
          color="error.main"
          onClick={() => {
            if (
              confirm(
                `Are you sure you would like to delete org membership from user with email ${member.user.email}?`
              )
            )
              deleteMember({
                variables: { memberId: member.id },
              });
          }}
        >
          <Box color="error.main">Delete</Box>
        </MenuItem>*/}
      </Menu>
    </>
  );
};

const PortaledLoadMore = ({ children }) => {
  if (typeof window !== "undefined")
    return ReactDOM.createPortal(
      children,
      document.getElementById("load-more")
    );
  return (
    <TableRow>
      <TableCell></TableCell>
    </TableRow>
  );
};

const Page = ({
  variables,
  isLastPage,
  onLoadMore,
  deleteMember,
  updateOrgMember,
  currentOrg,
}) => {
  const [{ data, fetching, error }] = useQuery({
    query: ORG_MEMBERS_QUERY,
    variables: {
      orgSlug: currentOrg.slug,
      offset: variables.offset,
      limit: variables.limit,
    },
  });

  const moreExist = data?.orgMembersPage?.moreExist;
  const orgMembers = data?.orgMembersPage?.orgMembers ?? [];

  if (error) {
    console.error(error);
    return null;
  }

  return (
    <>
      {orgMembers.map((member) => (
        <TableRow key={member.id}>
          <TableCell component="th" scope="row">
            {member.user.username}
          </TableCell>
          <TableCell component="th" scope="row">
            {member.name}
          </TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              <Box m="0 8px 0">{member.email}</Box>
              {!member.user.verifiedEmail && (
                <Tooltip title="Email not verified" placement="right">
                  <HelpOutlineOutlinedIcon fontSize="small" />
                </Tooltip>
              )}
            </Box>
          </TableCell>
          <TableCell component="th" scope="row">
            {member.bio}
          </TableCell>
          <TableCell align="right">
            {member.isOrgAdmin && <span className="mr-2">Admin</span>}
          </TableCell>
          <TableCell align="right" padding="none">
            <ActionsDropdown
              member={member}
              deleteMember={deleteMember}
              updateOrgMember={updateOrgMember}
              currentOrg={currentOrg}
            />
          </TableCell>
        </TableRow>
      ))}

      {isLastPage && moreExist && (
        <PortaledLoadMore>
          <LoadMore
            moreExist={moreExist}
            loading={fetching}
            onClick={() =>
              onLoadMore({
                limit: variables.limit,
                offset: variables.offset + orgMembers.length,
              })
            }
          />
        </PortaledLoadMore>
      )}
    </>
  );
};

const OrgMembersTable = ({ updateOrgMember, deleteMember, currentOrg }) => {
  const [pageVariables, setPageVariables] = useState([
    { limit: 30, offset: 0 },
  ]);

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Bio</TableCell>
                <TableCell align="right">Role</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageVariables.map((variables, i) => {
                return (
                  <Page
                    key={i}
                    variables={variables}
                    isLastPage={i === pageVariables.length - 1}
                    onLoadMore={({ limit, offset }) => {
                      setPageVariables([...pageVariables, { limit, offset }]);
                    }}
                    deleteMember={deleteMember}
                    updateOrgMember={updateOrgMember}
                    currentOrg={currentOrg}
                  />
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div id="load-more"></div>
    </>
  );
};

export default OrgMembersTable;
