import { DialogTitle } from "@headlessui/react";
import { useState } from "react";
import { useMutation, gql } from "urql";
import TextField from "../TextField";
import Button from "../Button";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import validateUsername from "utils/validateUsername";

const FIX_USERNAME_MUTATION = gql`
  mutation fixUsername($username: String) {
    updateProfile(username: $username) {
      id
      username
    }
  }
`;

export default function FixUsername({ currentUser }) {
  const [, updateUser] = useMutation(FIX_USERNAME_MUTATION);
  const [username, setUsername] = useState(currentUser.username ?? "");

  const intl = useIntl();

  return (
    <>
      <DialogTitle
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        <FormattedMessage
          defaultMessage={"Please update your username"}
          values={{
            bucketName: process.env.PLATFORM_NAME,
          }}
        />
      </DialogTitle>
      <p className="text-sm mt-2 text-gray-500">
        <FormattedMessage defaultMessage="We're adding some limitations to usernames and your username is currently not valid" />
      </p>

      <div className="space-y-4 mt-2">
        <TextField
          label={intl.formatMessage({ defaultMessage: "Username" })}
          error={!validateUsername(username)}
          inputProps={{
            value: username,
            onChange: (e) => setUsername(e.target.value),
          }}
        />
      </div>
      <p className="text-sm mt-2 text-gray-500">
        <FormattedMessage defaultMessage="Usernames can only contain A-Z, 0-9 and be between 2 and 20 characters long" />
      </p>
      <div className="mt-4 space-x-2 flex justify-end">
        <Button variant="secondary" href="/api/auth/logout">
          <FormattedMessage defaultMessage="Cancel" />
        </Button>
        <Button
          type="submit"
          disabled={!validateUsername(username)}
          onClick={() =>
            updateUser({ username }).then(({ data, error }) => {
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
                    { defaultMessage: `Username updated, hello {username}!` },
                    { username }
                  )
                );
              }
            })
          }
        >
          <FormattedMessage defaultMessage="Update username" />
        </Button>
      </div>
    </>
  );
}
