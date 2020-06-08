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

const ActionsDropdown = ({ updateMember, deleteMember, member }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
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
                `Are you sure you would like to delete membership from user with email ${member.user.email}?`
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

export default ({ approvedMembers, updateMember, deleteMember }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Bio</TableCell>
              <TableCell align="right">Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvedMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell component="th" scope="row">
                  {member.user.name}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Box m="0 8px 0">{member.user.email}</Box>
                    {!member.user.verifiedEmail && (
                      <Tooltip
                        title="Email not verified (has not logged in)"
                        placement="right"
                      >
                        <HelpOutlineOutlinedIcon fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell component="th" scope="row">
                  {member.user.bio}
                </TableCell>
                <TableCell align="right">
                  {member.isAdmin && <span className="mr-2">Admin</span>}
                  {member.isGuide && <span className="">Guide</span>}
                </TableCell>
                <TableCell align="right" padding="none">
                  <ActionsDropdown
                    member={member}
                    deleteMember={deleteMember}
                    updateMember={updateMember}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
