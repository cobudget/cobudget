import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

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
      <Transition appear show={show} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-30 overflow-y-auto"
          onClose={() => {
            return;
          }}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="z-50 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                {show && <Component currentUser={currentUser} />}
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      {currentUser.username && (
        <span className="invisible" data-testid="signup-user-fullname" />
      )}
    </>
  );
}
