import { Modal } from "@material-ui/core";
import { FormattedMessage } from "react-intl";
import FromBalance from "./FromBalance";

const ContributeModal = ({ handleClose, bucket, currentUser }) => {
  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-sm">
        <h1 className="text-2xl mb-2 font-semibold">
          <FormattedMessage defaultMessage="Contribute to" /> {bucket.title}
        </h1>
        <FromBalance
          currentUser={currentUser}
          bucket={bucket}
          handleClose={handleClose}
        />
      </div>
    </Modal>
  );
};

export default ContributeModal;
