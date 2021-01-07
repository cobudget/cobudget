import { Modal } from "@material-ui/core";
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

export default ({
  active,
  closeModal,
  currentOrgMember,
  currentOrg,
  currentUser,
}) => {
  const classes = useStyles();
  const ModalComponent = modalComponents[active];

  return (
    <Modal open={Boolean(active)} onClose={() => {}} className={classes.modal}>
      <div className={classes.innerModal}>
        {active && (
          <ModalComponent
            currentOrg={currentOrg}
            closeModal={closeModal}
            currentOrgMember={currentOrgMember}
            currentUser={currentUser}
          />
        )}
      </div>
    </Modal>
  );
};
