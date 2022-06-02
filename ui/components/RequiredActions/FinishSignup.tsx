import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useMutation, gql } from "urql";
import TextField from "../TextField";
import Button from "../Button";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import validateUsername from "utils/validateUsername";

const FINISH_SIGNUP_MUTATION = gql`
  mutation updateProfile($username: String, $name: String) {
    updateProfile(username: $username, name: $name) {
      id
      username
      name
    }
    acceptTerms {
      id
      acceptedTermsAt
    }
  }
`;

export default function FinishSignup({ currentUser }) {
  const [, updateUser] = useMutation(FINISH_SIGNUP_MUTATION);
  const [username, setUsername] = useState(currentUser.username ?? "");
  const [name, setName] = useState(currentUser.name ?? "");
  const intl = useIntl();

  const [acceptTerms, setAcceptTerms] = useState(
    process.env.TERMS_URL ? false : true
  );

  return (
    <>
      <Dialog.Title
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        <FormattedMessage
          defaultMessage={"Welcome to {bucketName}!"}
          values={{
            bucketName: process.env.PLATFORM_NAME,
          }}
        />
      </Dialog.Title>
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          <FormattedMessage defaultMessage="Please add your name and username." />
        </p>
      </div>
      <div className="space-y-4 mt-2">
        <TextField
          label={intl.formatMessage({ defaultMessage: "Name" })}
          inputProps={{
            value: name,
            onChange: (e) => setName(e.target.value),
          }}
        />
        <TextField
          label={intl.formatMessage({ defaultMessage: "Username" })}
          error={!validateUsername(username)}
          helperText={intl.formatMessage({
            defaultMessage:
              "Usernames can only contain A-z, 0-9 and be between 2 and 20 characters long",
          })}
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
                  a: (msg) => (
                    <a
                      className="text-blue underline"
                      target="_blank"
                      rel="noreferrer"
                      href={process.env.TERMS_URL}
                    >
                      {msg}
                    </a>
                  ),
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
                  toast.error(
                    intl.formatMessage({
                      defaultMessage: "Username already taken",
                    })
                  );
                } else {
                  toast.error(error.message);
                }
              } else {
                toast.success(
                  intl.formatMessage(
                    { defaultMessage: `Welcome to {bucketName}!` },
                    { bucketName: process.env.PLATFORM_NAME }
                  )
                );
              }
            })
          }
        >
          <FormattedMessage defaultMessage="Finish sign up" />
        </Button>
      </div>
    </>
  );
}
