import { Modal } from "@material-ui/core";
import EditProfile from "./EditProfile";
import FinishSignUp from "./FinishSignUp";
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
  FINISH_SIGN_UP: "FINISH_SIGN_UP",
  EDIT_PROFILE: "EDIT_PROFILE",
};

const modalComponents = {
  FINISH_SIGN_UP: FinishSignUp,
  EDIT_PROFILE: EditProfile,
};

export default ({ active, closeModal, currentUser }) => {
  const classes = useStyles();
  const ModalComponent = modalComponents[active];

  return (
    <Modal
      open={Boolean(active)}
      onClose={() => {
        if (active !== modals.FINISH_SIGN_UP) {
          closeModal();
        }
      }}
      className={classes.modal}
    >
      <div className={classes.innerModal}>
        {active && (
          <ModalComponent closeModal={closeModal} currentUser={currentUser} />
        )}
      </div>
    </Modal>
  );
};
