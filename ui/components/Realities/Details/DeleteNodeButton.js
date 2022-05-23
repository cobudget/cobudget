import PropTypes from "prop-types";
import styled from "styled-components";
import {
  Tooltip,
  Dialog,
  Button,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { FormattedMessage, useIntl } from "react-intl";

const Wrapper = styled.div`
  margin-bottom: 1rem;
`;

const DeleteNodeButton = ({
  nodeType,
  confirmationModalIsOpen,
  onToggleConfirmationModal,
  onConfirmSoftDelete,
  disabled,
  disabledReason,
  error,
}) => {
  return (
    <Wrapper>
      <Tooltip title={disabled && disabledReason ? disabledReason : ""}>
        <span>
          <Button
            color="secondary"
            onClick={onToggleConfirmationModal}
            disabled={disabled}
          >
            <FormattedMessage
              defaultMessage="Delete {name}"
              values={{
                name: nodeType.toLowerCase(),
              }}
            />
          </Button>
        </span>
      </Tooltip>
      {error && <p className="text-danger">{error}</p>}
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth="xs"
        open={confirmationModalIsOpen}
      >
        <DialogContent>
          <FormattedMessage
            defaultMessage="Are you sure you want to delete this {name}?"
            values={{
              name: nodeType.toLowerCase(),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            onClick={onConfirmSoftDelete}
            disabled={disabled}
          >
            <FormattedMessage
              defaultMessage="Yes, delete this {name}"
              values={{
                name: nodeType.toLowerCase(),
              }}
            />
          </Button>
          <Button onClick={onToggleConfirmationModal}>
            <FormattedMessage defaultMessage="Cancel" />
          </Button>
        </DialogActions>
      </Dialog>
    </Wrapper>
  );
};

DeleteNodeButton.propTypes = {
  nodeType: PropTypes.string,
  confirmationModalIsOpen: PropTypes.bool,
  onToggleConfirmationModal: PropTypes.func,
  onConfirmSoftDelete: PropTypes.func,
  disabled: PropTypes.bool,
  disabledReason: PropTypes.string,
  error: PropTypes.string,
};

DeleteNodeButton.defaultProps = {
  nodeType: "Need",
  confirmationModalIsOpen: false,
  onToggleConfirmationModal: () => null,
  onConfirmSoftDelete: () => null,
  disabled: false,
  disabledReason: "",
  error: "",
};

export default DeleteNodeButton;
