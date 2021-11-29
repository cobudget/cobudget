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

import BulkAllocateModal from "./BulkAllocateModal";
import IconButton from "components/IconButton";
import { AddIcon } from "components/Icons";
import Avatar from "components/Avatar";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AllocateModal from "./AllocateModal";
import thousandSeparator from "utils/thousandSeparator";

const ActionsDropdown = ({ eventId, updateMember, deleteMember, member }) => {
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
              eventId,

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
          onClick={() => {
            updateMember({
              eventId,
              memberId: member.id,
              isGuide: !member.isGuide,
            }).then(() => {
              handleClose();
            });
          }}
        >
          {member.isGuide ? "Remove guide" : "Make guide"}
        </MenuItem>
        <MenuItem
          color="error.main"
          onClick={() => {
            if (
              confirm(
                `Are you sure you would like to delete membership from user with email ${member.orgMember.user.email}?`
              )
            )
              deleteMember({ eventId, memberId: member.id });
          }}
        >
          <Box color="error.main">Delete</Box>
        </MenuItem>
      </Menu>
    </>
  );
};

const Row = ({ member, deleteMember, updateMember, event }) => {
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        <div className="flex space-x-3">
          <Avatar user={member.orgMember.user} />
          <div>
            <p className="font-medium text-base">
              {member.orgMember.user.name}
            </p>
            <p className="text-gray-700 text-sm">
              @{member.orgMember.user.username}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p>{member.email}</p>
        {!member.orgMember.user.verifiedEmail && (
          <p className="text-sm text-gray-500">(not verified)</p>
        )}
      </TableCell>
      <TableCell component="th" scope="row">
        {member.orgMember.bio && (
          <Tooltip
            position="bottom-start"
            size="small"
            title={member.orgMember.bio}
          >
            <p className="truncate max-w-xs">{member.orgMember.bio}</p>
          </Tooltip>
        )}
      </TableCell>
      <TableCell align="right" className="flex space-x-2">
        {member.isAdmin && <p>Admin</p>}
        {member.isGuide && <p>Guide</p>}
      </TableCell>
      <TableCell align="right">
        <button
          className="py-1 px-2 whitespace-nowrap rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => setAllocateModalOpen(true)}
        >
          {thousandSeparator(member.balance / 100)} {event.currency}
        </button>
        {allocateModalOpen && (
          <AllocateModal
            open={allocateModalOpen}
            member={member}
            event={event}
            handleClose={() => setAllocateModalOpen(false)}
          />
        )}
      </TableCell>
      <TableCell align="right" padding="none">
        <ActionsDropdown
          member={member}
          deleteMember={deleteMember}
          updateMember={updateMember}
          eventId={event.id}
        />
      </TableCell>
    </TableRow>
  );
};

const EventMembersTable = ({
  approvedMembers,
  updateMember,
  deleteMember,
  event,
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
                  <Tooltip
                    title="Allocate to all members"
                    position="bottom-center"
                    size="small"
                  >
                    <IconButton onClick={() => setBulkAllocateModalOpen(true)}>
                      <AddIcon className="h-4 w-4" />
                    </IconButton>
                  </Tooltip>
                </div>
                {bulkAllocateModalOpen && (
                  <BulkAllocateModal
                    event={event}
                    handleClose={() => setBulkAllocateModalOpen(false)}
                  />
                )}
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvedMembers.map((member) => (
              <Row
                key={member.id}
                member={member}
                event={event}
                deleteMember={deleteMember}
                updateMember={updateMember}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default EventMembersTable;
