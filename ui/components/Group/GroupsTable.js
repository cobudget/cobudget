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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { FormattedMessage, useIntl } from "react-intl";

const ActionsDropdown = ({ deleteGroup, updateGroup, group }) => {
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
            updateGroup({ groupId: group.id });
            handleClose();
          }}
        >
          <FormattedMessage defaultMessage="Update group" />
        </MenuItem>
        <MenuItem
          color="error.main"
          onClick={() => {
            if (
              confirm(
                intl.formatMessage(
                  {
                    defaultMessage: `Are you sure you would like to delete group {groupName}?`,
                  },
                  { groupName: group.name }
                )
              )
            )
              deleteGroup({
                variables: { groupId: group.id },
              });
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

export default ({ groups, updateGroup, deleteGroup }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <FormattedMessage defaultMessage="Logo" />
              </TableCell>
              <TableCell>
                <FormattedMessage defaultMessage="Name" />
              </TableCell>
              <TableCell>
                <FormattedMessage defaultMessage="Slug" />
              </TableCell>
              <TableCell align="right">
                <FormattedMessage defaultMessage="Actions" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell component="th" scope="row">
                  <img src={group.logo} className="h-7 w-7 rounded" />
                </TableCell>
                <TableCell component="th" scope="row">
                  {group.name}
                </TableCell>
                <TableCell component="th" scope="row">
                  {group.slug}
                </TableCell>

                <TableCell align="right" padding="none">
                  <ActionsDropdown
                    group={group}
                    deleteGroup={deleteGroup}
                    updateGroup={updateGroup}
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
