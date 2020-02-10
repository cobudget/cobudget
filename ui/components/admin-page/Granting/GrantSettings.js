import {
  List,
  ListItem,
  Divider,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Paper,
  Modal
} from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";

function numberWithSpaces(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
const modals = {
  SET_CURRENCY: () => <Paper>Set currency!</Paper>
};
export default ({ event }) => {
  const [open, setOpen] = React.useState(null);

  const handleOpen = modal => {
    setOpen(modal);
  };

  const handleClose = () => {
    setOpen(null);
  };
  const ModalContent = open ? modals[open] : () => <div>noting</div>;
  return (
    <>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={open}
        onClose={handleClose}
      >
        {/* <div style={modalStyle} className={classes.paper}> */}
        <ModalContent />
        {/* </div> */}
      </Modal>
      <List>
        <ListItem onClick={() => handleOpen("SET_CURRENCY")} button>
          <ListItemText primary="Currency" secondary={event.currency} />
        </ListItem>

        <Divider />

        <ListItem button>
          <ListItemText
            primary="Grants per member"
            secondary={event.grantsPerMember}
          />
        </ListItem>
        <Divider />

        <ListItem button>
          <ListItemText
            primary="Total budget"
            secondary={
              event.totalBudget
                ? `${numberWithSpaces(event.totalBudget)} ${event.currency}`
                : "Not set"
            }
          />
        </ListItem>
        <Divider />
        <ListItem button>
          <ListItemText
            primary="Grant value"
            secondary={
              event.grantValue
                ? `${numberWithSpaces(event.grantValue)} ${event.currency}`
                : "Not set"
            }
          />
        </ListItem>
        <Divider />
        <ListItem button>
          <ListItemText
            primary="Granting open date"
            secondary={
              !event.grantValue
                ? `${numberWithSpaces(event.grantValue)} ${event.currency}`
                : "Not set"
            }
          />
        </ListItem>
        <Divider />
        <ListItem button>
          <ListItemText
            primary="Granting closing date"
            secondary={
              !event.grantValue
                ? `${numberWithSpaces(event.grantValue)} ${event.currency}`
                : "Not set"
            }
          />
        </ListItem>
      </List>
    </>
  );
};
