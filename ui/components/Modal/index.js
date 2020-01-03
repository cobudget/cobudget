import styled from 'styled-components';
import FinishSignUp from './FinishSignUp';
import AddComment from './AddComment';

export const modals = {
  FINISH_SIGN_UP: 'FINISH_SIGN_UP',
  ADD_COMMENT: 'ADD_COMMENT',
};

const modalComponents = {
  FINISH_SIGN_UP: FinishSignUp,
  ADD_COMMENT: AddComment,
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

export default ({ active, closeModal, event }) => {
  const ModalComponent = modalComponents[active];

  return (
    active && (
      <Overlay
        onClick={() => {
          // can't close finish sign up modal by clicking on overlay :)
          if (active !== modals.FINISH_SIGN_UP) {
            closeModal();
          }
        }}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <ModalComponent closeModal={closeModal} event={event} />
        </div>
      </Overlay>
    )
  );
};
