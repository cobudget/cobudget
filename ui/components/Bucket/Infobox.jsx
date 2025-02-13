import { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

function Infobox({ bucket, isAdminOrModerator, isCocreator }) {
  const intl = useIntl();
  const userType = useMemo(() => {
    if (isAdminOrModerator) {
      return "admin";
    } else if (isCocreator) {
      return "cocreator";
    } else {
      return "user";
    }
  }, [isAdminOrModerator, isCocreator]);

  const status = useMemo(() => {
    if (userType === "admin" && bucket.status === "IDEA") {
      return bucket.readyForFunding
        ? "READY_FOR_FUNDING"
        : "NOT_READY_FOR_FUNDING";
    } else {
      return bucket.status;
    }
  }, [bucket, userType]);

  // allowed messages are shown when cocreators are allowed to open for funding
  const messages = useMemo(
    () => ({
      admin: {
        READY_FOR_FUNDING: intl.formatMessage({
          defaultMessage: "Ready to be opened for funding",
        }),
        NOT_READY_FOR_FUNDING: intl.formatMessage({
          defaultMessage: "Not ready for funding yet",
        }),
      },
      cocreator: {
        PENDING_APPROVAL: {
          allowed: intl.formatMessage({
            defaultMessage: "Publish your bucket to move it to the idea phase",
          }),
          notAllowed: intl.formatMessage({
            defaultMessage: "Publish your bucket to move it to the idea phase",
          }),
        },
        IDEA: {
          allowed: intl.formatMessage({
            defaultMessage:
              "To start collecting funds for this bucket, open it for funding.",
          }),
          notAllowed: intl.formatMessage({
            defaultMessage:
              "This bucket is waiting for an admin to open it for funding.",
          }),
        },
        OPEN_FOR_FUNDING: {
          allowed: intl.formatMessage({
            defaultMessage:
              "To accept funding, funds raised must match your budget. Edit your budget below to match the funding you received.",
          }),
          notAllowed: intl.formatMessage({
            defaultMessage:
              "To accept funding, funds raised must match your budget. Only admins can edit budgets after funding starts.",
          }),
        },
        FUNDED: {
          allowed: intl.formatMessage({
            defaultMessage:
              "When you have used your funding, you can mark this bucket as completed. Remember that it is usually appreciated to write a short message in the comments about how it turned out.",
          }),
          notAllowed: intl.formatMessage({
            defaultMessage:
              "When you have used your funding, you can mark this bucket as completed. Remember that it is usually appreciated to write a short message in the comments about how it turned out.",
          }),
        },
        PARTIAL_FUNDING: {
          allowed: intl.formatMessage({
            defaultMessage:
              "When you have used your funding, you can mark this bucket as completed. Remember that it is usually appreciated to write a short message in the comments about how it turned out.",
          }),
          notAllowed: intl.formatMessage({
            defaultMessage:
              "When you have used your funding, you can mark this bucket as completed. Remember that it is usually appreciated to write a short message in the comments about how it turned out.",
          }),
        },
      },
      user: {
        IDEA: intl.formatMessage({
          defaultMessage: "This bucket is waiting to be opened for funding.",
        }),
      },
    }),
    []
  );

  const message = useMemo(() => {
    if (userType === "cocreator") {
      let allowed = false;
      if (bucket.status === "OPEN_FOR_FUNDING") {
        allowed = bucket.round.canCocreatorStartFunding;
      } else {
        allowed = bucket.round.canCocreatorEditOpenBuckets;
      }
      return messages[userType]?.[status]?.[allowed ? "allowed" : "notAllowed"];
    } else {
      return messages[userType][status];
    }
  }, [userType, status, messages, bucket]);

  const showLabel = useMemo(() => {
    const hidden = [messages.admin.NOT_READY_FOR_FUNDING];
    return hidden.indexOf(message) === -1;
  }, [message]);

  if (message) {
    return (
      <a className="block mt-10 text-center rounded-lg border-2 border-yellow-400 px-6 py-4 font-semibold text-sm text-gray-600 bg-white cursor-pointer ">
        {showLabel && (
          <>
            <span className="text-black">
              <FormattedMessage defaultMessage="Next steps" />
            </span>{" "}
            <span className="bg-yellow-400 rounded px-1 mr-0.5 text-white text-xs">
              <FormattedMessage defaultMessage="TIP" />
            </span>
          </>
        )}{" "}
        {message}
      </a>
    );
  } else {
    return null;
  }
}

export default Infobox;
