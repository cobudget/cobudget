import { useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";

const ActionsDropdown = ({
  deleteOrganization,
  updateOrganization,
  organization,
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
            updateOrganization({ organizationId: organization.id });
            handleClose();
          }}
        >
          Update organization
        </MenuItem>
        <MenuItem
          color="error.main"
          onClick={() => {
            if (
              confirm(
                `Are you sure you would like to delete organization ${organization.name}?`
              )
            )
              deleteOrganization({
                variables: { organizationId: organization.id },
              });
          }}
        >
          <Box color="error.main">Delete</Box>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ({ organizations, updateOrganization, deleteOrganization }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Logo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Subdomain</TableCell>
              <TableCell>Custom Domain</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell component="th" scope="row">
                  <img src={organization.logo} className="h-7 w-7 rounded" />
                </TableCell>
                <TableCell component="th" scope="row">
                  {organization.name}
                </TableCell>
                <TableCell component="th" scope="row">
                  {organization.subdomain}
                </TableCell>
                <TableCell component="th" scope="row">
                  {organization.customDomain}
                </TableCell>

                <TableCell align="right" padding="none">
                  <ActionsDropdown
                    organization={organization}
                    deleteOrganization={deleteOrganization}
                    updateOrganization={updateOrganization}
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
