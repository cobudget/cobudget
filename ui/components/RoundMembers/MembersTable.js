import { useState } from "react";
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
import { useMutation } from "urql";

import BulkAllocateModal from "./BulkAllocateModal";
import IconButton from "components/IconButton";
import { AddIcon } from "components/Icons";
import Avatar from "components/Avatar";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AllocateModal from "./AllocateModal";
import thousandSeparator from "utils/thousandSeparator";
import toast from "react-hot-toast";

const ActionsDropdown = ({ roundId, updateMember, deleteMember, member }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const [, inviteAgain] = useMutation(INVITE_ROUND_MEMBERS_MUTATION);

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
        aria-label="more"
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
          {member.isAdmin ? "Remove admin" : "Make admin"}
        </MenuItem>
        {member.hasJoined ? null : (
          <MenuItem
            onClick={() => {
              inviteAgain({
                roundId,
                emails: member.email,
              }).then(() => {
                toast.success("Invitation sent again");
                handleClose();
              });
            }}
          >
            Invite Again
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
          title="You can only remove a round member with 0 balance"
          disabled={member.balance === 0}
        >
          <MenuItem
            color="error.main"
            disabled={member.balance !== 0}
            onClick={() => {
              if (
                confirm(
                  `Are you sure you would like to delete membership from user with email ${member.email}?`
                )
              )
                deleteMember({ collectionId, memberId: member.id }).then(
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
            <Box color="error.main">Delete</Box>
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
          <p className="text-sm text-gray-500">(not verified)</p>
        ) : !member.hasJoined ? (
          <p className="text-sm text-gray-500">(invitation pending)</p>
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
        {member.isAdmin && <p>Admin</p>}
        {member.isModerator && <p>Moderator</p>}
      </TableCell>
      <TableCell align="right">
        {isAdmin ? (
          <button
            className="py-1 px-2 whitespace-nowrap rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setAllocateModalOpen(true)}
          >
            {thousandSeparator(member.balance / 100)} {round.currency}
          </button>
        ) : (
          <span>
            {thousandSeparator(member.balance / 100)} {round.currency}
          </span>
        )}

        {allocateModalOpen && (
          <AllocateModal
            open={allocateModalOpen}
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
  approvedMembers,
  updateMember,
  deleteMember,
  round,
  isAdmin,
}) => {
  const [bulkAllocateModalOpen, setBulkAllocateModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Bio</TableCell>
              <TableCell align="right">Role</TableCell>
              <TableCell align="right">
                <div className="flex items-center justify-end space-x-1">
                  <span className="block">Balance</span>{" "}
                  {isAdmin && (
                    <Tooltip
                      title="Allocate to all members"
                      position="bottom-center"
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
              {isAdmin && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {approvedMembers.map((member) => (
              <Row
                key={member.id}
                member={member}
                round={round}
                deleteMember={deleteMember}
                updateMember={updateMember}
                isAdmin={isAdmin}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default RoundMembersTable;
