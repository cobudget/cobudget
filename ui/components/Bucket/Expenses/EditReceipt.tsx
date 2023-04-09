import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";
import TextField from "components/TextField";
import UploadAttachment from "./UploadAttachment";
import dayjs from "dayjs";
import Button from "components/Button";
import { gql, useMutation } from "urql";
import toast from "react-hot-toast";

const UPDATE_RECEIPT = gql`
  mutation UpdateExpenseReceipt(
    $id: String!
    $description: String
    $date: Date
    $amount: Int
    $attachment: String
  ) {
    updateExpenseReceipt(
      id: $id
      description: $description
      date: $date
      amount: $amount
      attachment: $attachment
    ) {
      id
      description
      date
      amount
      expenseId
      attachment
    }
  }
`;

function EditReceipt({ receiptToEdit, close, round }) {
  const intl = useIntl();
  const { handleSubmit, register, errors } = useForm();
  const [{ fetching }, updateReceipt] = useMutation(UPDATE_RECEIPT);

  const onSubmission = (variables) => {
    updateReceipt({
      ...variables,
      id: receiptToEdit?.id,
      amount: parseInt((variables.amount * 100).toFixed(0)),
    }).then(() => {
      close();
      toast.success(intl.formatMessage({ defaultMessage: "Receipt updated" }));
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-md">
      <h1 className="text-xl font-semibold">
        <FormattedMessage defaultMessage="Edit Receipt" />
      </h1>
      <form onSubmit={handleSubmit(onSubmission)}>
        <div className="flex gap-2 my-2">
          <div className="flex-grow">
            <TextField
              className="my-1"
              name="description"
              size="small"
              placeholder={intl.formatMessage({
                defaultMessage: "Description",
              })}
              inputRef={register()}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              defaultValue={receiptToEdit?.description}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row mt-2">
          <UploadAttachment
            name="attachment"
            cloudinaryPreset="organization_logos"
            inputRef={register({})}
            defaultLink={receiptToEdit?.attachment}
          />

          <div className="mr-2 sm:my-0 flex-1">
            <TextField
              className="my-1"
              name={"date"}
              size="small"
              placeholder={intl.formatMessage({
                defaultMessage: "Date",
              })}
              inputRef={register({})}
              inputProps={{ type: "date" }}
              error={Boolean(errors.date)}
              helperText={errors.date?.message}
              defaultValue={
                receiptToEdit?.date
                  ? dayjs(new Date(receiptToEdit.date)).format("YYYY-MM-DD")
                  : undefined
              }
            />
          </div>
          <div className="mr-2 sm:my-0 flex-1">
            <TextField
              className="my-1"
              name={"amount"}
              size="small"
              placeholder={intl.formatMessage({
                defaultMessage: "Amount",
              })}
              inputRef={register({})}
              inputProps={{ type: "number", min: 0 }}
              error={Boolean(errors.amount)}
              helperText={errors.amount?.message}
              endAdornment={round.currency}
              defaultValue={(receiptToEdit?.amount / 100).toFixed(2)}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={close} variant="secondary" className="mr-2">
            <FormattedMessage defaultMessage="Cancel" />
          </Button>
          <Button type="submit" loading={fetching}>
            <FormattedMessage defaultMessage="Update" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditReceipt;
