import { useForm } from "react-hook-form";

import { useMutation, gql } from "urql";
import Router from "next/router";

import { Modal } from "@mui/material";

import TextField from "components/TextField";
import Button from "components/Button";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { MAX_BUCKET_TITLE_LENGTH } from "../constants";
import Link from "next/link";

const CREATE_BUCKET = gql`
  mutation CreateBucket($roundId: ID!, $title: String!) {
    createBucket(roundId: $roundId, title: $title) {
      id
      title
      round {
        id
        slug
      }
    }
  }
`;

const NewBucketModal = ({ round, handleClose, router, bucketsLimit }) => {
  const intl = useIntl();
  const [{ fetching: loading }, createBucket] = useMutation(CREATE_BUCKET);

  const { handleSubmit, register, formState: { errors } } = useForm();

  const onSubmitCreate = (variables) => {
    createBucket({ ...variables, roundId: round.id }).then(
      ({ data, error }) => {
        if (error) {
          toast.error(error.message);
        } else {
          console.log({ data });
          Router.push(
            "/[group]/[round]/[bucket]",
            `/${router.query.group}/${round.slug}/${data.createBucket.id}`
          );
          handleClose();
        }
      }
    );
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        {bucketsLimit?.isLimitOver ? (
          <div>
            <h1 className="text-xl font-semibold">
              <FormattedMessage
                defaultMessage="New {bucketName}"
                values={{
                  bucketName: process.env.BUCKET_NAME_SINGULAR,
                }}
              />
            </h1>
            <p>
              <FormattedMessage defaultMessage="Move this round to a paid group or create a new group to add more buckets to this round" />
            </p>
            <div className="my-2">
              <Link href="/new-group">
                <Button>
                  <FormattedMessage defaultMessage="New Group" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmitCreate)}>
            <h1 className="text-xl font-semibold">
              <FormattedMessage
                defaultMessage="New {bucketName}"
                values={{
                  bucketName: process.env.BUCKET_NAME_SINGULAR,
                }}
              />
            </h1>

            <TextField
              className="my-3"
              size="large"
              placeholder={intl.formatMessage({ defaultMessage: "Title" })}
              inputRef={register("title", { required: "Required" }).ref}
              inputProps={{
                ...register("title", { required: "Required" }),
                maxLength: MAX_BUCKET_TITLE_LENGTH,
              }}
              autoFocus
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
              color={round.color}
              testid="new-bucket-title-input"
            />

            {bucketsLimit?.consumedPercentage >= 75 &&
              bucketsLimit.status === "free" && (
                <p className="my-2 text-red-600">
                  <FormattedMessage
                    defaultMessage="{remainingCount} free {remainingCount, plural, one {bucket} other {buckets}} left which can be funded. Upgrade to increase your funded buckets count."
                    values={{
                      remainingCount: Math.max(
                        bucketsLimit.limit - bucketsLimit.currentCount,
                        0
                      ),
                    }}
                  />
                </p>
              )}

            <div className="flex justify-end">
              <Button
                size="large"
                variant="secondary"
                onClick={handleClose}
                className="mr-3"
                color={round.color}
              >
                <FormattedMessage defaultMessage="Cancel" />
              </Button>
              <Button
                size="large"
                type="submit"
                loading={loading}
                color={round.color}
              >
                <FormattedMessage defaultMessage="Create" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default NewBucketModal;
