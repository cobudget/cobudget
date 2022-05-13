import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton as MuiIconButton,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { Tooltip } from "react-tippy";
import { INVITE_ROUND_MEMBERS_MUTATION } from "../InviteMembersModal";
import { gql, useMutation, useQuery } from "urql";

import BulkAllocateModal from "./BulkAllocateModal";
import IconButton from "components/IconButton";
import { AddIcon } from "components/Icons";
import Avatar from "components/Avatar";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AllocateModal from "./AllocateModal";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl, FormattedNumber } from "react-intl";
import { debounce } from "lodash";
import LoadMore, { PortaledLoadMore } from "components/LoadMore";

export const MEMBERS_QUERY = gql`
  query Members($roundId: ID!, $search: String!, $offset: Int, $limit: Int) {
    membersPage(
      roundId: $roundId
      isApproved: true
      search: $search
      offset: $offset
      limit: $limit
    ) {
      moreExist
      members(
        roundId: $roundId
        isApproved: true
        offset: $offset
        limit: $limit
      ) {
        id
        isAdmin
        isModerator
        isApproved
        createdAt
        balance
        email
        hasJoined
        user {
          id
          username
          name
          verifiedEmail
          avatar
        }
      }
    }
  }
`;

const Page = ({
  variables,
  round,
  isLastPage,
  onLoadMore,
  deleteMember,
  updateMember,
  isAdmin,
  searchString,
}) => {
  const [{ data, fetching, error }, searchMembers] = useQuery({
    query: MEMBERS_QUERY,
    variables: {
      roundId: round.id,
      search: searchString,
      offset: variables.offset,
      limit: variables.limit,
    },
    pause: true,
  });

  const moreExist = data?.membersPage?.moreExist || false;

  const debouncedSearchMembers = useMemo(() => {
    return debounce(searchMembers, 300, { leading: true });
  }, [searchMembers]);

  const items = useMemo(() => {
    const members = data?.membersPage?.members || [];
    if (fetching || !members) {
      return [];
    }
    return members;
  }, [data?.membersPage?.members, fetching]);

  useEffect(() => {
    debouncedSearchMembers();
  }, [debouncedSearchMembers]);

  return (
    <>
      {items.map((member) => (
        <Row
          key={member.id}
          member={member}
          deleteMember={deleteMember}
          updateMember={updateMember}
          round={round}
          isAdmin={isAdmin}
        />
      ))}

      {isLastPage && moreExist && (
        <PortaledLoadMore>
          <LoadMore
            moreExist={moreExist}
            loading={fetching}
            onClick={() =>
              onLoadMore({
                limit: variables.limit,
                offset: variables.offset + items.length,
              })
            }
          />
        </PortaledLoadMore>
      )}
    </>
  );
};

const ActionsDropdown = ({ roundId, updateMember, deleteMember, member }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const [, inviteAgain] = useMutation(INVITE_ROUND_MEMBERS_MUTATION);

  const intl = useIntl();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <MuiIconButton
        aria-label={intl.formatMessage({ defaultMessage: "more" })}
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </MuiIconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            updateMember({
              roundId,

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
        {member.hasJoined ? null : (
          <MenuItem
            onClick={() => {
              inviteAgain({
                roundId,
                emails: member.email,
              }).then(() => {
                toast.success(
                  intl.formatMessage({
                    defaultMessage: "Invitation sent again",
                  })
                );
                handleClose();
              });
            }}
          >
            <FormattedMessage defaultMessage="Invite Again" />
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            updateMember({
              roundId,
              memberId: member.id,
              isModerator: !member.isModerator,
            }).then(() => {
              handleClose();
            });
          }}
        >
          {member.isModerator ? "Remove moderator" : "Make moderator"}
        </MenuItem>
        <Tooltip
          title={intl.formatMessage({
            defaultMessage:
              "You can only remove a round participant with 0 balance",
          })}
          disabled={member.balance === 0}
        >
          <MenuItem
            color="error.main"
            disabled={member.balance !== 0}
            onClick={() => {
              if (
                confirm(
                  intl.formatMessage(
                    {
                      defaultMessage:
                        "Are you sure you would like to delete membership from user with email {email}?",
                    },
                    { email: member.email }
                  )
                )
              )
                deleteMember({ roundId, memberId: member.id }).then(
                  ({ error }) => {
                    if (error) {
                      console.error(error);
                      toast.error(error.message);
                    }
                    handleClose();
                  }
                );
            }}
          >
            <Box color="error.main">
              <FormattedMessage defaultMessage="Delete" />
            </Box>
          </MenuItem>
        </Tooltip>
      </Menu>
    </>
  );
};

const Row = ({ member, deleteMember, updateMember, round, isAdmin }) => {
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        <div className="flex space-x-3">
          <Avatar user={member.user} />
          <div>
            <p className="font-medium text-base">{member.user.name}</p>
            {member.user.username && (
              <p className="text-gray-700 text-sm">@{member.user.username}</p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p>{member.email}</p>
        {!member.user.verifiedEmail ? (
          <p className="text-sm text-gray-500">
            (<FormattedMessage defaultMessage="not verified" />)
          </p>
        ) : !member.hasJoined ? (
          <p className="text-sm text-gray-500">
            (<FormattedMessage defaultMessage="invitation pending" />)
          </p>
        ) : null}
      </TableCell>
      <TableCell component="th" scope="row">
        {member.bio && (
          <Tooltip position="bottom-start" size="small" title={member.bio}>
            <p className="truncate max-w-xs">{member.bio}</p>
          </Tooltip>
        )}
      </TableCell>
      <TableCell align="right" className="flex space-x-2">
        {member.isAdmin && (
          <p>
            <FormattedMessage defaultMessage="Admin" />
          </p>
        )}
        {member.isModerator && (
          <p>
            <FormattedMessage defaultMessage="Moderator" />
          </p>
        )}
      </TableCell>
      <TableCell align="right">
        {isAdmin ? (
          <button
            className="py-1 px-2 whitespace-nowrap rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setAllocateModalOpen(true)}
          >
            <FormattedNumber
              value={member.balance / 100}
              style="currency"
              currencyDisplay={"symbol"}
              currency={round.currency}
            />
          </button>
        ) : (
          <span>
            <FormattedNumber
              value={member.balance / 100}
              style="currency"
              currencyDisplay={"symbol"}
              currency={round.currency}
            />
          </span>
        )}

        {allocateModalOpen && (
          <AllocateModal
            member={member}
            round={round}
            handleClose={() => setAllocateModalOpen(false)}
          />
        )}
      </TableCell>
      {isAdmin && (
        <TableCell align="right" padding="none">
          <ActionsDropdown
            member={member}
            deleteMember={deleteMember}
            updateMember={updateMember}
            roundId={round.id}
          />
        </TableCell>
      )}
    </TableRow>
  );
};

const RoundMembersTable = ({
  updateMember,
  deleteMember,
  round,
  isAdmin,
  searchString,
}) => {
  const [bulkAllocateModalOpen, setBulkAllocateModalOpen] = useState(false);
  const intl = useIntl();

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
                  <FormattedMessage defaultMessage="User" />
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
                  <div className="flex items-center justify-end space-x-1">
                    <span className="block">
                      <FormattedMessage defaultMessage="Balance" />
                    </span>{" "}
                    {isAdmin && (
                      <Tooltip
                        title={intl.formatMessage({
                          defaultMessage: "Allocate to all members",
                        })}
                        position="bottom"
                        size="small"
                      >
                        <IconButton
                          onClick={() => setBulkAllocateModalOpen(true)}
                        >
                          <AddIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                  {bulkAllocateModalOpen && (
                    <BulkAllocateModal
                      round={round}
                      handleClose={() => setBulkAllocateModalOpen(false)}
                    />
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    <FormattedMessage defaultMessage="Actions" />
                  </TableCell>
                )}
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
                    updateMember={updateMember}
                    isAdmin={isAdmin}
                    round={round}
                    searchString={searchString}
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

export default RoundMembersTable;
