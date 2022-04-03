import { Modal as MUIModal } from "@material-ui/core";
import EditProfile from "./EditProfile";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center",
  },
  innerModal: {
    outline: "none",
  },
}));

export const modals = {
  EDIT_PROFILE: "EDIT_PROFILE",
};

const modalComponents = {
  EDIT_PROFILE: EditProfile,
};

const Modal = ({ active, closeModal, currentUser }) => {
  const classes = useStyles();
  const ModalComponent = modalComponents[active];

  return (
    <MUIModal
      open={Boolean(active)}
      onClose={() => {
        return;
      }}
      className={classes.modal}
    >
      <div className={classes.innerModal}>
        {active && (
          <ModalComponent
            currentGroup={currentGroup}
            closeModal={closeModal}
            currentUser={currentUser}
          />
        )}
      </div>
    </MUIModal>
  );
};

export default Modal;
