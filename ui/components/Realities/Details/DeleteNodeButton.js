import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Button, Modal, ModalBody, ModalFooter, Tooltip } from "reactstrap";

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
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <Wrapper>
      {disabled && disabledReason && (
        <Tooltip
          isOpen={tooltipOpen}
          toggle={() => setTooltipOpen(!tooltipOpen)}
          target="DeleteNodeButton"
        >
          {disabledReason}
        </Tooltip>
      )}
      <Button
        color="danger"
        onClick={onToggleConfirmationModal}
        disabled={disabled}
        id="DeleteNodeButton"
      >
        Delete {nodeType.toLowerCase()}
      </Button>
      {error && <p className="text-danger">{error}</p>}
      <Modal
        isOpen={confirmationModalIsOpen}
        toggle={onToggleConfirmationModal}
      >
        <ModalBody>
          Are you sure you want to delete this {nodeType.toLowerCase()}?
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            onClick={onConfirmSoftDelete}
            disabled={disabled}
          >
            Yes, delete this {nodeType.toLowerCase()}
          </Button>
          <Button color="link" onClick={onToggleConfirmationModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
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
