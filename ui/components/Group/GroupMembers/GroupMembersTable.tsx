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
import { FormattedMessage, useIntl } from "react-intl";

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
  const intl = useIntl();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton
        aria-label={intl.formatMessage({ defaultMessage: "more" })}
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
          {member.isAdmin
            ? intl.formatMessage({ defaultMessage: "Remove admin" })
            : intl.formatMessage({ defaultMessage: "Make admin" })}
        </MenuItem>
        <MenuItem
          color="error.main"
          onClick={() => {
            if (
              confirm(
                intl.formatMessage(
                  {
                    defaultMessage: `Are you sure you would like to delete group membership from user with email {email}?`,
                  },
                  { email: member.email }
                )
              )
            ) {
              deleteGroupMember({
                groupId: currentGroup.id,
                groupMemberId: member.id,
              }).then(({ error }) => {
                if (error) {
                  console.error(error);
                  toast.error(error.message);
                } else {
                  toast.success(
                    intl.formatMessage(
                      {
                        defaultMessage: `Deleted group member with email {email}`,
                      },
                      { email: member.email }
                    )
                  );
                }
                handleClose();
              });
            }
          }}
        >
          <Box color="error.main">
            <FormattedMessage defaultMessage="Delete" />
          </Box>
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

  const intl = useIntl();
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
                <Tooltip
                  title={intl.formatMessage({
                    defaultMessage: "Email not verified",
                  })}
                  placement="right"
                >
                  <HelpOutlineOutlinedIcon fontSize="small" />
                </Tooltip>
              )}
            </Box>
          </TableCell>
          <TableCell component="th" scope="row">
            {member.bio}
          </TableCell>
          <TableCell align="right">
            {member.isAdmin && (
              <span className="mr-2">
                <FormattedMessage defaultMessage="Admin" />
              </span>
            )}
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
                <TableCell>
                  <FormattedMessage defaultMessage="Username" />
                </TableCell>
                <TableCell>
                  <FormattedMessage defaultMessage="Name" />
                </TableCell>
                <TableCell>
                  <FormattedMessage defaultMessage="Email" />
                </TableCell>
                <TableCell>
                  <FormattedMessage defaultMessage="Bio" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage defaultMessage="Role" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage defaultMessage="Actions" />
                </TableCell>
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
