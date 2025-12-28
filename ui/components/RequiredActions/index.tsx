import { Dialog, DialogBackdrop, DialogPanel, Transition, TransitionChild } from "@headlessui/react";

import dayjs from "dayjs";
import FinishSignup from "./FinishSignup";
import AcceptUpdatedTerms from "./AcceptUpdatedTerms";
import FixUsername from "./FixUsername";
import validateUsername from "../../utils/validateUsername";

export default function RequiredActions({ currentUser }) {
  if (!currentUser) return null;

  const modals = {
    finishSignup: {
      show: !currentUser.username,
      component: FinishSignup,
    },
    acceptNewTerms: {
      show:
        process.env.TERMS_URL &&
        process.env.TERMS_UPDATED_AT &&
        (!currentUser.acceptedTermsAt ||
          dayjs(currentUser.acceptedTermsAt).isBefore(
            dayjs(process.env.TERMS_UPDATED_AT)
          )),
      component: AcceptUpdatedTerms,
    },
    fixUsername: {
      show: !validateUsername(currentUser.username),
      component: FixUsername,
    },
  };

  const showModals = Object.keys(modals).filter((key) => modals[key].show);

  // show the first modal that is true
  const Component = modals[showModals[0]]?.component;
  const show = !!showModals.length;

  return (
    <>
      <Dialog
        open={show}
        as="div"
        className="fixed inset-0 z-30 overflow-y-auto"
        onClose={() => {
          return;
        }}
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 data-[closed]:opacity-0"
        />
        <div className="min-h-screen px-4 text-center">
          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <DialogPanel
            transition
            className="z-50 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl duration-300 data-[closed]:opacity-0 data-[closed]:scale-95"
          >
            {show && <Component currentUser={currentUser} />}
          </DialogPanel>
        </div>
      </Dialog>
      {currentUser.username && (
        <span className="invisible" data-testid="signup-user-fullname" />
      )}
    </>
  );
}
