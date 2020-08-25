import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import { Modal } from "@material-ui/core";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { DeleteIcon, AddIcon } from "components/Icons";

import * as yup from "yup";

const EDIT_BUDGET_MUTATION = gql`
  mutation EditBudget($dreamId: ID!, $budgetItems: [BudgetItemInput]) {
    editDream(dreamId: $dreamId, budgetItems: $budgetItems) {
      id
      minGoal
      maxGoal
      minGoalGrants
      maxGoalGrants
      budgetItems {
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
      min: yup.number().positive().integer().required(),
      max: yup
        .number()
        .transform((cv) => (isNaN(cv) ? undefined : cv))
        .nullable()
        .positive()
        .integer()
        .moreThan(yup.ref("min"), "Max should be > min"),
      type: yup.string().required(),
    })
  ),
});

export default ({
  dreamId,
  budgetItems,
  event,
  currency,
  allowStretchGoals,
  handleClose,
  open,
}) => {
  const [editDream, { loading }] = useMutation(EDIT_BUDGET_MUTATION, {
    variables: { dreamId },
  });

  const { handleSubmit, register, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { budgetItems },
  });

  const { fields, append, insert, remove } = useFieldArray({
    control,
    name: "budgetItems",
  });

  const incomeItems = fields.filter((field) => field.type === "INCOME");
  const expenseItems = fields.filter((field) => field.type === "EXPENSE");

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-md">
        <h1 className="text-xl font-semibold mb-4">Edit budget</h1>
        <form
          onSubmit={handleSubmit((variables) => {
            editDream({
              variables: { budgetItems: [...(variables.budgetItems ?? [])] },
            })
              .then((data) => {
                handleClose();
              })
              .catch((err) => alert(err.message));
          })}
        >
          <h2 className="text-lg font-semibold mb-2">Income</h2>

          {incomeItems.map(({ id, description, type, min }, index) => {
            return (
              <div className={`flex flex-col sm:flex-row my-2`} key={id}>
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
                    defaultValue={min}
                    inputProps={{ type: "number" }}
                    inputRef={register()}
                    endAdornment={<span>{currency}</span>}
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

          <h2 className="text-lg font-semibold mb-2">Expenses</h2>

          {expenseItems.map(({ id, description, type, min, max }, i) => {
            const index = i + incomeItems.length;
            return (
              <div className={`flex flex-col sm:flex-row my-2`} key={id}>
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
                    defaultValue={min}
                    inputProps={{ type: "number", min: 0 }}
                    inputRef={register()}
                    endAdornment={<span>{currency}</span>}
                  />
                </div>

                {allowStretchGoals && (
                  <div className="mr-2 my-2 sm:my-0">
                    <TextField
                      placeholder="Max amount"
                      name={`budgetItems[${index}].max`}
                      defaultValue={max}
                      inputProps={{ type: "number", min: 0 }}
                      inputRef={register()}
                      endAdornment={<span>{currency}</span>}
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
          <div className="flex mb-2">
            <Button
              variant="secondary"
              onClick={() => append({ type: "EXPENSE" })}
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
              {event.guidelinesMarkdown && (
                <a
                  href={`/${event.slug}/about#guidelines`}
                  target="_blank"
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
