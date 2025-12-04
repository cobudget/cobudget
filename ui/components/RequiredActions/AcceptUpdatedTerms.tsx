import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useMutation, gql } from "urql";
import TextField from "../TextField";
import Button from "../Button";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import dayjs from "dayjs";
import { CheckRounded } from "@mui/icons-material";

const ACCEPT_TERMS_MUTATION = gql`
  mutation acceptTerms {
    acceptTerms {
      id
      acceptedTermsAt
    }
  }
`;

export default function AcceptUpdatedTerms() {
  const [checked, setChecked] = useState(false);
  const [, acceptTerms] = useMutation(ACCEPT_TERMS_MUTATION);
  const intl = useIntl();

  return (
    <>
      <Dialog.Title
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        <FormattedMessage
          defaultMessage={
            "We've updated the {platformName} Terms and Conditions on {date}"
          }
          values={{
            platformName: process.env.PLATFORM_NAME,
            date: dayjs(process.env.TERMS_UPDATED_AT).format("YYYY-MM-DD"),
          }}
        />
      </Dialog.Title>
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          <FormattedMessage
            defaultMessage="To continue using the platform you need to review and accept the updated Terms and Conditions"
            values={{
              date: dayjs(process.env.TERMS_UPDATED_AT).format("YYYY-MM-DD"),
            }}
          />
        </p>
      </div>
      <div className="space-y-4 my-6">
        <label className="text-sm flex items-center space-x-2">
          <input
            value={checked.toString()}
            onChange={(e) => {
              setChecked(!checked);
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
      </div>
      <div className="mt-4 space-x-2 flex justify-end">
        <Button variant="secondary" href="/api/auth/logout">
          <FormattedMessage defaultMessage="Cancel" />
        </Button>
        <Button
          type="submit"
          disabled={!checked}
          onClick={() =>
            acceptTerms().then(({ data, error }) => {
              if (error) {
                toast.error(error.message);
              } else {
                toast.success(
                  intl.formatMessage({ defaultMessage: `Thank you!` })
                );
              }
            })
          }
        >
          <FormattedMessage defaultMessage="Accept terms" />
        </Button>
      </div>
    </>
  );
}
