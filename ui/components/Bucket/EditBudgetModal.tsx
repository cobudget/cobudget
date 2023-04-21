import { useMutation, gql } from "urql";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import { Modal } from "@material-ui/core";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { DeleteIcon, AddIcon } from "components/Icons";
import { FormattedMessage, useIntl } from "react-intl";

import * as yup from "yup";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const EDIT_BUDGET_MUTATION = gql`
  mutation EditBudget($bucketId: ID!, $budgetItems: [BudgetItemInput]) {
    editBucket(bucketId: $bucketId, budgetItems: $budgetItems) {
      id
      minGoal
      maxGoal
      income
      budgetItems {
        id
        description
        min
        max
        type
      }
    }
  }
`;

const schema = yup.object().shape({
  budgetItems: yup.array().of(
    yup.object().shape({
      description: yup.string().required(),
      min: yup.number().integer().min(0).required(),
      max: yup
        .number()
        .transform((cv) => (isNaN(cv) ? undefined : cv))
        .nullable()
        .min(0)
        .integer()
        .moreThan(
          yup.ref("min"),
          "Max amount should be greater than min amount"
        ),
      type: yup.string().required(),
    })
  ),
});

const EditBudgetModal = ({
  bucket,
  budgetItems,
  currency,
  allowStretchGoals,
  handleClose,
  open,
}) => {
  const [{ fetching: loading }, editBucket] = useMutation(EDIT_BUDGET_MUTATION);
  const [maxAmountOpenInputs, setMaxAmountOpenInputs] = useState({});
  const intl = useIntl();

  const { handleSubmit, register, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { budgetItems },
  });

  const { fields, append, insert, remove } = useFieldArray({
    control,
    name: "budgetItems",
    keyName: "fieldId",
  });

  const incomeItems = fields.filter((field) => field.type === "INCOME");
  const expenseItems = fields.filter((field) => field.type === "EXPENSE");

  const checkErrors = (errors) => {
    if (errors?.budgetItems?.length > 0) {
      const err = Object.keys(errors.budgetItems[0]);
      if (err.length === 0) {
        return;
      }
      toast.error(errors.budgetItems[0][err[0]].message);
    }
  };

  useEffect(() => {
    const opened = {};
    budgetItems.forEach((item, i) => {
      if (item.max) opened[item.id] = true;
    });
    setMaxAmountOpenInputs(opened);
  }, [budgetItems]);

  //for new rows, this function returns an id
  const getPreId = useCallback((type, index) => {
    return `${type}-${index}`;
  }, []);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex items-start justify-center p-4 md:pt-16 overflow-y-scroll max-h-screen"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-md">
        <h1 className="text-xl font-semibold mb-4">
          <FormattedMessage defaultMessage="Edit budget" />
        </h1>
        <form
          onSubmit={handleSubmit((variables) => {
            const budgetTypeCount = {
              EXPENSE: 0,
              INCOME: 0,
            };
            editBucket({
              bucketId: bucket.id,
              budgetItems: [
                ...(variables.budgetItems?.map((item, i) => {
                  const preId = getPreId(item.type, budgetTypeCount[item.type]);
                  budgetTypeCount[item.type]++;
                  return {
                    ...item,
                    id: undefined, //remove id
                    min: Math.round(item.min * 100),
                    ...(item.max &&
                      maxAmountOpenInputs[item.id || preId] && {
                        max: Math.round(item.max * 100),
                      }),
                  };
                }) ?? []),
              ],
            })
              .then(() => {
                handleClose();
              })
              .catch((err) => alert(err.message));
          }, checkErrors)}
        >
          <h2 className="text-lg font-semibold mb-2">
            <FormattedMessage defaultMessage="Costs" />
          </h2>

          {expenseItems.map(
            ({ id, fieldId, description, type, min, max }, i) => {
              const index = i + incomeItems.length;
              return (
                <div className={`flex flex-col sm:flex-row my-2`} key={fieldId}>
                  <div className="mr-2 my-2 sm:my-0 flex-1">
                    <input
                      name={`budgetItems[${index}].id`}
                      value={id}
                      readOnly
                      className="hidden"
                      ref={register()}
                    />
                    <TextField
                      placeholder={intl.formatMessage({
                        defaultMessage: "Description",
                      })}
                      name={`budgetItems[${index}].description`}
                      defaultValue={description}
                      inputRef={register()}
                      testid={`bucket-expense-item-description`}
                    />
                    <input
                      name={`budgetItems[${index}].type`}
                      value={type}
                      ref={register()}
                      readOnly
                      className="hidden"
                    />
                  </div>
                  <div className="mr-2 my-2 sm:my-0 flex-1">
                    <TextField
                      placeholder={
                        allowStretchGoals
                          ? intl.formatMessage({ defaultMessage: "Min amount" })
                          : intl.formatMessage({ defaultMessage: "Amount" })
                      }
                      name={`budgetItems[${index}].min`}
                      defaultValue={
                        typeof min !== "undefined" ? String(min / 100) : null
                      }
                      inputProps={{ type: "number", min: 0 }}
                      inputRef={register()}
                      endAdornment={currency}
                      testid={`bucket-expense-item-min-amount`}
                    />
                  </div>

                  {allowStretchGoals && (
                    <div className="mr-2 my-2 sm:my-0 flex-1 relative">
                      {maxAmountOpenInputs[id || getPreId(type, i)] ? (
                        <>
                          <TextField
                            placeholder={intl.formatMessage({
                              defaultMessage: "Max amount",
                            })}
                            name={`budgetItems[${index}].max`}
                            defaultValue={
                              typeof max === "undefined" || max === null
                                ? null
                                : String(max / 100)
                            }
                            inputProps={{ type: "number", min: 0 }}
                            inputRef={register()}
                            endAdornment={currency}
                          />
                          <span
                            className="absolute -right-2 -top-2 bg-gray-200 rounded-full flex items-center justify-center h-6 w-6 cursor-pointer"
                            onClick={() => {
                              setMaxAmountOpenInputs({
                                ...maxAmountOpenInputs,
                                [id || getPreId(type, i)]: false,
                              });
                            }}
                          >
                            ✖
                          </span>
                        </>
                      ) : (
                        <p
                          onClick={() => {
                            setMaxAmountOpenInputs({
                              ...maxAmountOpenInputs,
                              [id || getPreId(type, i)]: true,
                            });
                          }}
                          className="underline cursor-pointer mt-4 text-sm text-color-gray"
                        >
                          + Add a range
                        </p>
                      )}
                    </div>
                  )}
                  <div className="my-2">
                    <IconButton onClick={() => remove(index)}>
                      <DeleteIcon className="h-6 w-6 text-color-red" />
                    </IconButton>
                  </div>
                </div>
              );
            }
          )}
          <div className="flex mb-4">
            <Button
              variant="secondary"
              color={bucket.round.color}
              onClick={() => append({ type: "EXPENSE" })}
              className="flex-grow"
              testid="add-bucket-cost-button"
            >
              <AddIcon className="h-5 w-5 mr-1" />{" "}
              <FormattedMessage defaultMessage="Add row" />
            </Button>
          </div>

          <h2 className="text-lg font-semibold my-2">
            <FormattedMessage defaultMessage="Existing funding and resources" />
          </h2>

          {incomeItems.map(({ id, fieldId, description, type, min }, index) => {
            return (
              <div className={`flex flex-col sm:flex-row my-2`} key={fieldId}>
                <div className="mr-2 my-2 sm:my-0 flex-grow">
                  <input
                    name={`budgetItems[${index}].id`}
                    value={id}
                    readOnly
                    className="hidden"
                    ref={register()}
                  />
                  <TextField
                    placeholder={intl.formatMessage({
                      defaultMessage: "Description",
                    })}
                    name={`budgetItems[${index}].description`}
                    inputRef={register()}
                    defaultValue={description}
                    testid={`bucket-existing-item-${fieldId}-description`}
                  />
                  <input
                    name={`budgetItems[${index}].type`}
                    value={type}
                    ref={register()}
                    readOnly
                    className="hidden"
                  />
                </div>

                <div className="mr-2 my-2 sm:my-0">
                  <TextField
                    placeholder={intl.formatMessage({
                      defaultMessage: "Amount",
                    })}
                    name={`budgetItems[${index}].min`}
                    defaultValue={
                      typeof min !== "undefined" ? String(min / 100) : null
                    }
                    inputProps={{ type: "number", min: 0 }}
                    inputRef={register()}
                    endAdornment={currency}
                    testid={`bucket-existing-item-${fieldId}-amount`}
                  />
                </div>

                <div className="my-2">
                  <IconButton onClick={() => remove(index)}>
                    <DeleteIcon className="h-6 w-6 text-color-red" />
                  </IconButton>
                </div>
              </div>
            );
          })}
          <div className="flex mb-2">
            <Button
              variant="secondary"
              color={bucket.round.color}
              onClick={() =>
                insert(fields.filter((f) => f.type === "INCOME").length, {
                  type: "INCOME",
                })
              }
              className="flex-grow"
            >
              <AddIcon className="h-5 w-5 mr-1" />{" "}
              <FormattedMessage defaultMessage="Add row" />
            </Button>
          </div>

          {/* <div>
            Total funding goal: {thousandSeparator(minGoal)} {currency}
          </div> */}

          <div className="flex justify-between items-center">
            <div className="pl-4">
              {Boolean(bucket.round.guidelines.length) && (
                <a
                  href={`/${bucket.round.group?.slug ?? "c"}/${
                    bucket.round.slug
                  }/about#guidelines`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-600 font-medium hover:text-gray-800"
                >
                  <FormattedMessage defaultMessage="See funding guidelines" />
                </a>
              )}
            </div>
            <div className="flex">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="mr-2"
              >
                <FormattedMessage defaultMessage="Cancel" />
              </Button>
              <Button
                type="submit"
                loading={loading}
                testid="add-budget-submit-buton"
              >
                <FormattedMessage defaultMessage="Save" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditBudgetModal;
