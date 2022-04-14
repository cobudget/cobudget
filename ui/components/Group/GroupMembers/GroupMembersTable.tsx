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
import toast from "react-hot-toast";
import { useQuery, gql } from "urql";
import LoadMore from "../../LoadMore";

export const GROUP_MEMBERS_QUERY = gql`
  query GroupMembers($groupId: ID!, $offset: Int, $limit: Int) {
    groupMembersPage(groupId: $groupId, offset: $offset, limit: $limit) {
      moreExist
      groupMembers {
        id
        isAdmin
        bio
        email
        name
        user {
          id
          name
          username
          verifiedEmail
          avatar
        }
      }
    }
  }
`;

const ActionsDropdown = ({
  updateGroupMember,
  deleteGroupMember,
  currentGroup,
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
            updateGroupMember({
              groupId: currentGroup.id,
              memberId: member.id,
              isAdmin: !member.isAdmin,
            }).then(() => {
              handleClose();
            });
          }}
        >
          {member.isAdmin ? "Remove admin" : "Make admin"}
        </MenuItem>
        <MenuItem
          color="error.main"
          onClick={() => {
            if (
              confirm(
                `Are you sure you would like to delete group membership from user with email ${member.email}?`
              )
            ) {
              deleteGroupMember({
                groupMemberId: member.id,
              }).then(({ error }) => {
                if (error) {
                  console.error(error);
                  toast.error(error.message);
                } else {
                  toast.success(
                    `Deleted group member with email ${member.email}`
                  );
                }
                handleClose();
              });
            }
          }}
        >
          <Box color="error.main">Delete</Box>
        </MenuItem>
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
  deleteGroupMember,
  updateGroupMember,
  currentGroup,
}) => {
  const [{ data, fetching, error }] = useQuery({
    query: GROUP_MEMBERS_QUERY,
    variables: {
      groupId: currentGroup.id,
      offset: variables.offset,
      limit: variables.limit,
    },
  });

  const moreExist = data?.groupMembersPage?.moreExist;
  const groupMembers = data?.groupMembersPage?.groupMembers ?? [];

  if (error) {
    console.error(error);
    return null;
  }

  return (
    <>
      {groupMembers.map((member) => (
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
            {member.isAdmin && <span className="mr-2">Admin</span>}
          </TableCell>
          <TableCell align="right" padding="none">
            <ActionsDropdown
              member={member}
              deleteGroupMember={deleteGroupMember}
              updateGroupMember={updateGroupMember}
              currentGroup={currentGroup}
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
                offset: variables.offset + groupMembers.length,
              })
            }
          />
        </PortaledLoadMore>
      )}
    </>
  );
};

const GroupMembersTable = ({
  updateGroupMember,
  deleteGroupMember,
  currentGroup,
}) => {
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
                    deleteGroupMember={deleteGroupMember}
                    updateGroupMember={updateGroupMember}
                    currentGroup={currentGroup}
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

export default GroupMembersTable;
