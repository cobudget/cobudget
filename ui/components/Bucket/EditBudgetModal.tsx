import { useMutation, gql } from "urql";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import { Modal } from "@material-ui/core";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { DeleteIcon, AddIcon } from "components/Icons";

import * as yup from "yup";

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
        .moreThan(yup.ref("min"), "Max should be > min"),
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

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex items-start justify-center p-4 md:pt-16 overflow-y-scroll max-h-screen"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-md">
        <h1 className="text-xl font-semibold mb-4">Edit budget</h1>
        <form
          onSubmit={handleSubmit((variables) => {
            editBucket({
              bucketId: bucket.id,
              budgetItems: [
                ...(variables.budgetItems?.map((item) => ({
                  ...item,
                  min: Math.round(item.min * 100),
                  ...(item.max && { max: Math.round(item.max * 100) }),
                })) ?? []),
              ],
            })
              .then(() => {
                handleClose();
              })
              .catch((err) => alert(err.message));
          })}
        >
          <h2 className="text-lg font-semibold mb-2">Costs</h2>

          {expenseItems.map(({ fieldId, description, type, min, max }, i) => {
            const index = i + incomeItems.length;
            return (
              <div className={`flex flex-col sm:flex-row my-2`} key={fieldId}>
                <div className="mr-2 my-2 sm:my-0 flex-grow">
                  <TextField
                    placeholder="Description"
                    name={`budgetItems[${index}].description`}
                    defaultValue={description}
                    inputRef={register()}
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
                    placeholder={allowStretchGoals ? "Min amount" : "Amount"}
                    name={`budgetItems[${index}].min`}
                    defaultValue={
                      typeof min !== "undefined" ? String(min / 100) : null
                    }
                    inputProps={{ type: "number", min: 0 }}
                    inputRef={register()}
                    endAdornment={currency}
                  />
                </div>

                {allowStretchGoals && (
                  <div className="mr-2 my-2 sm:my-0">
                    <TextField
                      placeholder="Max amount"
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
                  </div>
                )}
                <div className="my-2">
                  <IconButton onClick={() => remove(index)}>
                    <DeleteIcon className="h-6 w-6 text-color-red" />
                  </IconButton>
                </div>
              </div>
            );
          })}
          <div className="flex mb-4">
            <Button
              variant="secondary"
              color={bucket.round.color}
              onClick={() => append({ type: "EXPENSE" })}
              className="flex-grow"
            >
              <AddIcon className="h-5 w-5 mr-1" /> Add row
            </Button>
          </div>

          <h2 className="text-lg font-semibold my-2">
            Existing funding and resources
          </h2>

          {incomeItems.map(({ fieldId, description, type, min }, index) => {
            return (
              <div className={`flex flex-col sm:flex-row my-2`} key={fieldId}>
                <div className="mr-2 my-2 sm:my-0 flex-grow">
                  <TextField
                    placeholder="Description"
                    name={`budgetItems[${index}].description`}
                    inputRef={register()}
                    defaultValue={description}
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
                    placeholder={"Amount"}
                    name={`budgetItems[${index}].min`}
                    defaultValue={
                      typeof min !== "undefined" ? String(min / 100) : null
                    }
                    inputProps={{ type: "number", min: 0 }}
                    inputRef={register()}
                    endAdornment={currency}
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
              <AddIcon className="h-5 w-5 mr-1" /> Add row
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
                  See funding guidelines
                </a>
              )}
            </div>
            <div className="flex">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditBudgetModal;
