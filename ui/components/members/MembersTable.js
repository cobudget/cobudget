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
import Avatar from "components/Avatar";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";
import AllocateModal from "./AllocateModal";

const ActionsDropdown = ({ updateMember, deleteMember, member }) => {
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
            updateMember({
              variables: {
                memberId: member.id,
                isAdmin: !member.isAdmin,
              },
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
              variables: {
                memberId: member.id,
                isGuide: !member.isGuide,
              },
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
              deleteMember({
                variables: { memberId: member.id },
              });
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
        <Box display="flex" alignItems="center">
          <Box m="0 8px 0">{member.orgMember.user.email}</Box>
          {!member.orgMember.user.verifiedEmail && (
            <Tooltip title="Email not verified" placement="right">
              <HelpOutlineOutlinedIcon fontSize="small" />
            </Tooltip>
          )}
        </Box>
      </TableCell>
      <TableCell component="th" scope="row">
        <p className="line-clamp-1">{member.orgMember.bio}</p>
      </TableCell>
      <TableCell align="right">
        {member.isAdmin && <span className="mr-2">Admin</span>}
        {member.isGuide && <span className="">Guide</span>}
      </TableCell>
      <TableCell align="right">
        <button
          className="py-1 px-2 whitespace-nowrap rounded hover:bg-green-200"
          onClick={() => setAllocateModalOpen(true)}
        >
          {member.balance / 100} {event.currency}
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
              <TableCell align="right">Balance</TableCell>
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
