import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useMutation, gql } from "urql";
import TextField from "./TextField";
import Button from "./Button";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl, } from "react-intl";
const UPDATE_PROFILE_QUERY = gql`
  mutation updateProfile($username: String, $name: String) {
    updateProfile(username: $username, name: $name) {
      id
      username
      name
    }
  }
`;
export default function FinishSignup({ isOpen, currentUser }) {
  const [, updateUser] = useMutation(UPDATE_PROFILE_QUERY);
  const [username, setUsername] = useState(currentUser?.username ?? "");
  const [name, setName] = useState(currentUser?.name ?? "");
  const intl = useIntl();

  const [acceptTerms, setAcceptTerms] = useState(
    process.env.TERMS_URL ? false : true
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
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
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                <FormattedMessage
                  defaultMessage={"Welcome to {bucketName}!"}
                  values={{
                    bucketName: process.env.PLATFORM_NAME
                  }}
                />
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  <FormattedMessage
                    defaultMessage="Please add your name and username."
                  />
                </p>
              </div>
              <div className="space-y-4 mt-2">
                <TextField
                  label={intl.formatMessage({ defaultMessage:"Name"})}
                  inputProps={{
                    value: name,
                    onChange: (e) => setName(e.target.value),
                  }}
                />
                <TextField
                  label={intl.formatMessage({ defaultMessage:"Username" })}
                  inputProps={{
                    value: username,
                    onChange: (e) => setUsername(e.target.value),
                  }}
                />
                {process.env.TERMS_URL && (
                  <label className="text-sm flex items-center space-x-2">
                    <input
                      value={acceptTerms.toString()}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setAcceptTerms(!acceptTerms);
                      }}
                      type="checkbox"
                    />{" "}
                    <span>
                      <FormattedMessage 
                        defaultMessage="I accept the {bucketName} <a>Terms and Conditions</a>"
                        values={{
                          bucketName: process.env.PLATFORM_NAME,
                          a: msg => (
                              <a
                                className="text-blue underline"
                                target="_blank"
                                rel="noreferrer"
                                href={process.env.TERMS_URL}
                              >{msg}</a>
                          )
                        }}
                      />
                    </span>
                  </label>
                )}
              </div>
              <div className="mt-4 space-x-2 flex justify-end">
                <Button variant="secondary" href="/api/auth/logout">
                  <FormattedMessage defaultMessage="Cancel" />
                </Button>
                <Button
                  type="submit"
                  disabled={!username || !name || !acceptTerms}
                  onClick={() =>
                    updateUser({ username, name }).then(({ data, error }) => {
                      if (error) {
                        if (error.message.includes("Unique")) {
                          toast.error(intl.formatMessage({ defaultMessage:"Username already taken" }));
                        } else {
                          toast.error(error.message);
                        }
                      } else {
                        toast.success(
                          intl.formatMessage({ defaultMessage:`Welcome to {bucketName}!` }, { values: {bucketName: process.env.PLATFORM_NAME} })
                        )
                      }
                    })
                  }
                >
                  <FormattedMessage defaultMessage="Finish sign up" />
                </Button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
