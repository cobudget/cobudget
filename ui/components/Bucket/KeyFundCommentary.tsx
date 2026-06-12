import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useMutation } from "urql";
import Tooltip from "@tippyjs/react";

import Button from "components/Button";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";

const EDIT_KEY_FUND_COMMENTARY = gql`
  mutation EditBucketKeyFundCommentary(
    $bucketId: ID!
    $keyFundCommentary: String
  ) {
    editBucket(bucketId: $bucketId, keyFundCommentary: $keyFundCommentary) {
      id
      keyFundCommentary
    }
  }
`;

const KeyFundCommentary = ({
  bucket,
  canEdit,
}: {
  bucket: any;
  canEdit: boolean;
}) => {
  const intl = useIntl();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(bucket.keyFundCommentary ?? "");
  const [{ fetching }, saveCommentary] = useMutation(EDIT_KEY_FUND_COMMENTARY);

  if (!bucket.keyFundCommentary && !canEdit) return null;

  if (editing) {
    return (
      <div className="mb-4">
        <textarea
          className="border rounded px-3 py-2 text-sm w-full"
          rows={5}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setValue(bucket.keyFundCommentary ?? "");
                setEditing(false);
              }}
            >
              <FormattedMessage defaultMessage="Cancel" />
            </Button>
            <Button
              loading={fetching}
              onClick={() =>
                saveCommentary({
                  bucketId: bucket.id,
                  keyFundCommentary: value || null,
                }).then(({ error }) => {
                  if (error) alert(error.message);
                  else setEditing(false);
                })
              }
            >
              <FormattedMessage defaultMessage="Save" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (bucket.keyFundCommentary) {
    return (
      <div className="relative mb-4">
        <p className="whitespace-pre-line text-gray-800">
          {bucket.keyFundCommentary}
        </p>
        {canEdit && (
          <div className="absolute top-0 right-0">
            <Tooltip
              content={intl.formatMessage({ defaultMessage: "Edit commentary" })}
              placement="bottom"
              arrow={false}
            >
              <IconButton onClick={() => setEditing(true)}>
                <EditIcon className="h-6 w-6" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }

  if (canEdit) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="block w-full h-24 text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
      >
        <FormattedMessage defaultMessage="+ Key Fund commentary" />
      </button>
    );
  }

  return null;
};

export default KeyFundCommentary;
