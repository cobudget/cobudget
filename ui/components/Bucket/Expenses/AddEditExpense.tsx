import Button from "components/Button";
import TextField from "components/TextField";
import { GRAPHQL_EXPENSE_COCREATOR_ONLY } from "../../../constants";
import { GRAPHQL_NOT_LOGGED_IN } from "../../../constants";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useMutation } from "urql";
import IconButton from "components/IconButton";
import { DeleteIcon, AddIcon } from "components/Icons";
import styled from "styled-components";
import UploadAttachment from "./UploadAttachment";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";

const FormWrapper = styled.div`
  max-height: calc(100vh - 120px);
  overflow-y: auto;
`;

const SUBMIT_EXPENSE = gql`
  mutation CreateExpense(
    $bucketId: String!
    $title: String!
    $recipientName: String!
    $recipientEmail: String!
    $swiftCode: String
    $iban: String
    $country: String!
    $city: String!
    $recipientAddress: String!
    $recipientPostalCode: String!
  ) {
    createExpense(
      bucketId: $bucketId
      title: $title
      recipientName: $recipientName
      recipientEmail: $recipientEmail
      swiftCode: $swiftCode
      iban: $iban
      country: $country
      city: $city
      recipientAddress: $recipientAddress
      recipientPostalCode: $recipientPostalCode
    ) {
      id
      bucketId
      title
    }
  }
`;

const SUBMIT_RECEIPT = gql`
  mutation CreateExpenseReceipt(
    $description: String
    $date: Date
    $amount: Int
    $attachment: String
    $expenseId: String
  ) {
    createExpenseReceipt(
      description: $description
      date: $date
      amount: $amount
      attachment: $attachment
      expenseId: $expenseId
    ) {
      id
      expense {
        id
        amount
      }
    }
  }
`;

export const UPDATE_EXPENSE = gql`
  mutation UpdateExpense(
    $id: String!
    $title: String
    $recipientName: String
    $recipientEmail: String
    $swiftCode: String
    $iban: String
    $country: String
    $city: String!
    $recipientAddress: String
    $recipientPostalCode: String
  ) {
    updateExpense(
      id: $id
      title: $title
      recipientName: $recipientName
      recipientEmail: $recipientEmail
      swiftCode: $swiftCode
      iban: $iban
      country: $country
      city: $city
      recipientAddress: $recipientAddress
      recipientPostalCode: $recipientPostalCode
    ) {
      id
      title
      recipientName
      recipientEmail
      swiftCode
      iban
      country
      city
      recipientAddress
      recipientPostalCode
    }
  }
`;

function AddEditExpense({ bucketId, close, round, expenseToEdit = undefined }) {
  const intl = useIntl();

  const [{ fetching: submitFetching }, submitExpense] = useMutation(
    SUBMIT_EXPENSE
  );
  const [{ fetching: updateFetching }, updateExpense] = useMutation(
    UPDATE_EXPENSE
  );
  const [{ error: addReceiptError }, submitReceipt] = useMutation(
    SUBMIT_RECEIPT
  );

  const schema = yup.object().shape({
    receipts: yup.array().of(
      yup.object().shape({
        description: yup.string().required(),
        date: yup.string().required(),
        amount: yup.string().required(),
      })
    ),
    title: yup.string().required(),
    recipientName: yup.string().required(),
    recipientEmail: yup
      .string()
      .email(intl.formatMessage({ defaultMessage: "Invalid email" })),
    country: yup.string().required(),
    city: yup.string().required(),
    recipientAddress: yup.string().required(),
    recipientPostalCode: yup.string().required(),
  });

  const { handleSubmit, register, errors, control } = useForm({
    resolver: yupResolver(schema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "receipts",
    keyName: "fieldId",
  });

  const onSubmission = (variables) => {
    if (expenseToEdit) {
      updateExpense({
        ...variables,
        id: expenseToEdit.id,
      }).then(() => {
        toast.success(
          intl.formatMessage({ defaultMessage: "Expense updated" })
        );
        close();
      });
    } else {
      submitExpense({
        ...variables,
        bucketId,
      }).then(async (data) => {
        if (data.error?.message.indexOf(GRAPHQL_NOT_LOGGED_IN) > -1) {
          toast.error(
            intl.formatMessage({
              defaultMessage: "You need to login to submit an expense",
            })
          );
          return;
        } else if (
          data.error?.message.indexOf(GRAPHQL_EXPENSE_COCREATOR_ONLY) > -1
        ) {
          toast.error(
            intl.formatMessage({
              defaultMessage: "Only cocreators can add expense",
            })
          );
          return;
        }

        const expenseId = data.data.createExpense.id;

        const receipts =
          variables.receipts?.filter((f) => f.description && f.amount) || [];

        if (receipts.length > 0) {
          const promises = receipts.map((form) => {
            return submitReceipt({
              ...form,
              expenseId,
              amount: Number(form.amount) * 100,
              date: new Date(form.date).getTime(),
            });
          });
          await Promise.allSettled(promises);
        }

        toast.success(intl.formatMessage({ defaultMessage: "Expense Added" }));
        close();
      });
    }
  };

  useEffect(() => {
    // If expense is being added, add a receipt form
    // by default
    if (!expenseToEdit) {
      append({});
    }
  }, [append, expenseToEdit]);

  const fetching = submitFetching || updateFetching;

  return (
    <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-md">
      <form onSubmit={handleSubmit(onSubmission)}>
        <h1 className="text-xl font-semibold">
          <FormattedMessage defaultMessage="Submit Expense" />
        </h1>
        <FormWrapper>
          <TextField
            className="my-1"
            name="title"
            size="small"
            placeholder={intl.formatMessage({ defaultMessage: "Title" })}
            inputRef={register({
              required: "Required",
            })}
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
            defaultValue={expenseToEdit?.title}
          />
          {expenseToEdit ? null : (
            <>
              <h2 className="text-xl font-semibold mt-2">
                <FormattedMessage defaultMessage="Receipts" />
              </h2>

              {fields.map(({ fieldId, description }, index) => (
                <div key={fieldId}>
                  <div className="flex gap-2 my-2">
                    <div className="flex-grow">
                      <TextField
                        className="my-1"
                        name={`receipts[${index}].description`}
                        size="small"
                        placeholder={intl.formatMessage({
                          defaultMessage: "Description",
                        })}
                        inputRef={register()}
                        error={Boolean(errors.description)}
                        helperText={errors.description?.message}
                        defaultValue={description}
                      />
                    </div>
                    <div className="my-2">
                      <IconButton onClick={() => remove(index)}>
                        <DeleteIcon className="h-6 w-6 text-color-red" />
                      </IconButton>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row mt-2">
                    <UploadAttachment
                      name={`receipts[${index}].attachment`}
                      cloudinaryPreset="organization_logos"
                      inputRef={register({})}
                    />

                    <div className="mr-2 sm:my-0 flex-1">
                      <TextField
                        className="my-1"
                        name={`receipts[${index}].date`}
                        size="small"
                        placeholder={intl.formatMessage({
                          defaultMessage: "Date",
                        })}
                        inputRef={register({})}
                        inputProps={{ type: "date" }}
                        error={Boolean(errors.date)}
                        helperText={errors.date?.message}
                      />
                    </div>
                    <div className="mr-2 sm:my-0 flex-1">
                      <TextField
                        className="my-1"
                        name={`receipts[${index}].amount`}
                        size="small"
                        placeholder={intl.formatMessage({
                          defaultMessage: "Amount",
                        })}
                        inputRef={register({})}
                        inputProps={{ type: "number", min: 0 }}
                        error={Boolean(errors.amount)}
                        helperText={errors.amount?.message}
                        endAdornment={round.currency}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-2">
                <Button
                  onClick={() => {
                    append({});
                  }}
                  fullWidth
                >
                  <AddIcon className="h-5 w-5 mr-1" />{" "}
                  <FormattedMessage defaultMessage="Add receipt" />
                </Button>
              </div>
            </>
          )}

          <h2 className="text-xl font-semibold mt-2">
            <FormattedMessage defaultMessage="Payment Method" />
          </h2>

          <div className="flex flex-col sm:flex-row mt-2">
            <div className="mr-2 sm:my-0 flex-1">
              <TextField
                className="my-1"
                name="recipientName"
                size="small"
                placeholder={intl.formatMessage({
                  defaultMessage: "Full name of recipient",
                })}
                inputRef={register({
                  required: "Required",
                })}
                error={Boolean(errors.recipientName)}
                helperText={errors.recipientName?.message}
                defaultValue={expenseToEdit?.recipientName}
              />
            </div>
            <div className="mr-2 sm:my-0 flex-1">
              <TextField
                className="my-1"
                name="recipientEmail"
                size="small"
                placeholder={intl.formatMessage({
                  defaultMessage: "Recipient Email",
                })}
                inputRef={register({
                  required: "Required",
                })}
                error={Boolean(errors.recipientEmail)}
                helperText={errors.recipientEmail?.message}
                defaultValue={expenseToEdit?.recipientEmail}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            <div className="mr-2 sm:my-0 flex-1">
              <TextField
                className="my-1"
                name="swiftCode"
                size="small"
                placeholder={intl.formatMessage({
                  defaultMessage: "Bank code (BIC/SWIFT)",
                })}
                inputRef={register({
                  required: "Required",
                })}
                error={Boolean(errors.swiftCode)}
                helperText={errors.swiftCode?.message}
                defaultValue={expenseToEdit?.swiftCode}
              />
            </div>
            <div className="mr-2 sm:my-0 flex-1">
              <TextField
                className="my-1"
                name="iban"
                size="small"
                placeholder={intl.formatMessage({
                  defaultMessage: "IBAN number",
                })}
                inputRef={register({
                  required: "Required",
                })}
                error={Boolean(errors.iban)}
                helperText={errors.iban?.message}
                defaultValue={expenseToEdit?.iban}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            <div className="mr-2 sm:my-0 flex-1">
              <TextField
                className="my-1"
                name="country"
                size="small"
                placeholder={intl.formatMessage({ defaultMessage: "Country" })}
                inputRef={register({
                  required: "Required",
                })}
                error={Boolean(errors.country)}
                helperText={errors.country?.message}
                defaultValue={expenseToEdit?.country}
              />
            </div>
            <div className="mr-2 sm:my-0 flex-1">
              <TextField
                className="my-1"
                name="city"
                size="small"
                placeholder={intl.formatMessage({ defaultMessage: "City" })}
                inputRef={register({
                  required: "Required",
                })}
                error={Boolean(errors.city)}
                helperText={errors.city?.message}
                defaultValue={expenseToEdit?.city}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            <div className="mr-2 sm:my-0 flex-1">
              <TextField
                className="my-1"
                name="recipientAddress"
                size="small"
                placeholder={intl.formatMessage({
                  defaultMessage: "Recipient Address",
                })}
                inputRef={register({
                  required: "Required",
                })}
                error={Boolean(errors.recipientAddress)}
                helperText={errors.recipientAddress?.message}
                defaultValue={expenseToEdit?.recipientAddress}
              />
            </div>
            <div className="mr-2 sm:my-0 flex-1">
              <TextField
                className="my-1"
                name="recipientPostalCode"
                size="small"
                placeholder={intl.formatMessage({
                  defaultMessage: "Postal Code",
                })}
                inputRef={register({
                  required: "Required",
                })}
                error={Boolean(errors.recipientPostalCode)}
                helperText={errors.recipientPostalCode?.message}
                defaultValue={expenseToEdit?.recipientPostalCode}
              />
            </div>
          </div>
        </FormWrapper>
        <div className="flex justify-end mt-4">
          <Button onClick={close} variant="secondary" className="mr-2">
            <FormattedMessage defaultMessage="Cancel" />
          </Button>
          <Button type="submit" loading={fetching}>
            {expenseToEdit ? (
              <FormattedMessage defaultMessage="Update" />
            ) : (
              <FormattedMessage defaultMessage="Save" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddEditExpense;
