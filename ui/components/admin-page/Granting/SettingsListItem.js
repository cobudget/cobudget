import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button
} from "@material-ui/core";
import { Edit as EditIcon, Add as AddIcon } from "@material-ui/icons";

const SettingsListItem = ({
  primary,
  secondary,
  value,
  openModal,
  disabled
}) => {
  return (
    <ListItem>
      <ListItemText primary={primary} secondary={secondary} />
      <ListItemSecondaryAction>
        {value ? (
          <IconButton onClick={openModal} disabled={disabled}>
            <EditIcon />
          </IconButton>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openModal}
            disabled={disabled}
          >
            Set
          </Button>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default SettingsListItem;
