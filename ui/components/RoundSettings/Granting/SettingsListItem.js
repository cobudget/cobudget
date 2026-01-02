import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import Button from "components/Button";
import EditIcon from "@mui/icons-material/Edit";
import { AddIcon } from "components/Icons";
import { FormattedMessage } from "react-intl";

const SettingsListItem = ({
  primary,
  secondary,
  isSet,
  openModal,
  disabled = false,
  canEdit,
  roundColor,
}) => {
  return (
    <ListItem className={disabled ? "opacity-50" : ""}>
      <ListItemText primary={primary} secondary={secondary} />
      {canEdit && (
        <ListItemSecondaryAction>
          {isSet ? (
            <IconButton onClick={openModal} disabled={disabled}>
              <EditIcon />
            </IconButton>
          ) : (
            <Button
              color={roundColor}
              size="small"
              onClick={openModal}
              disabled={disabled}
            >
              <AddIcon className="h-4 w-4 -ml-2 mr-2" />
              <FormattedMessage defaultMessage="Set" />
            </Button>
          )}
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

export default SettingsListItem;
