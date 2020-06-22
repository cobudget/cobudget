import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { useForm } from "react-hook-form";
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
  budgetItems: initialBudgetItems = [],
  event,
  currency,
  allowStretchGoals,
  handleClose,
  open,
}) => {
  const [editDream, { loading }] = useMutation(EDIT_BUDGET_MUTATION, {
    variables: { dreamId },
  });

  const { handleSubmit, register, errors } = useForm({
    validationSchema: schema,
  });

  const emptyExpense = {
    description: undefined,
    min: undefined,
    max: undefined,
    type: "EXPENSE",
  };

  const emptyIncome = {
    description: undefined,
    min: undefined,
    max: undefined,
    type: "INCOME",
  };

  const [incomeItems, setIncomeItems] = useState(
    initialBudgetItems.filter((item) => item.type === "INCOME")
  );

  const initialExpenses = initialBudgetItems.filter(
    (item) => item.type === "EXPENSE"
  );
  const [expenseItems, setExpenseItems] = useState(
    initialExpenses.length ? initialExpenses : [emptyExpense]
  );

  const addIncomeRow = () => setIncomeItems([...incomeItems, emptyIncome]);
  const removeIncomeRow = (i) =>
    setIncomeItems([...incomeItems.filter((item, index) => i !== index)]);

  const addExpenseRow = () => setExpenseItems([...expenseItems, emptyExpense]);
  const removeExpenseRow = (i) =>
    setExpenseItems([...expenseItems.filter((item, index) => i !== index)]);

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
            console.log({ variables });
            editDream({ variables })
              .then((data) => {
                console.log({ data });
                handleClose();
              })
              .catch((err) => alert(err.message));
          })}
        >
          <h2 className="text-lg font-semibold mb-2">Income</h2>

          {incomeItems.map((budgetItem, index) => {
            const fieldName = `budgetItems[${index}]`;
            return (
              <div className={`flex flex-col sm:flex-row my-2`} key={fieldName}>
                <div className="mr-2 my-2 sm:my-0 flex-grow">
                  <input
                    className="hidden"
                    name={`${fieldName}.type`}
                    value={budgetItem.type}
                    ref={register}
                    readOnly
                  />
                  <TextField
                    placeholder="Description"
                    name={`${fieldName}.description`}
                    defaultValue={budgetItem.description}
                    inputRef={register({
                      required: "Required",
                    })}
                  />
                </div>

                <div className="mr-2 my-2 sm:my-0">
                  <TextField
                    placeholder={allowStretchGoals ? "Min amount" : "Amount"}
                    name={`${fieldName}.min`}
                    defaultValue={budgetItem.min}
                    inputProps={{ type: "number" }}
                    inputRef={register({ required: "Required", min: 0 })}
                  />
                </div>

                <div className="my-2">
                  <IconButton onClick={() => removeIncomeRow(index)}>
                    <DeleteIcon className="h-6 w-6 text-color-red" />
                  </IconButton>
                </div>
              </div>
            );
          })}
          <div className="flex mb-2">
            <Button
              variant="secondary"
              onClick={addIncomeRow}
              className="flex-grow"
            >
              <AddIcon className="h-5 w-5 mr-1" /> Add row
            </Button>
          </div>

          <h2 className="text-lg font-semibold mb-2">Expenses</h2>

          {expenseItems.map((budgetItem, index) => {
            const fieldName = `budgetItems[${incomeItems.length + index}]`;
            return (
              <div className={`flex flex-col sm:flex-row my-2`} key={fieldName}>
                <div className="mr-2 my-2 sm:my-0 flex-grow">
                  <input
                    name={`${fieldName}.type`}
                    value={budgetItem.type}
                    ref={register}
                    className="hidden"
                    readOnly
                  />
                  <TextField
                    placeholder="Description"
                    name={`${fieldName}.description`}
                    defaultValue={budgetItem.description}
                    inputRef={register({
                      required: "Required",
                    })}
                  />
                </div>
                <div className="mr-2 my-2 sm:my-0">
                  <TextField
                    placeholder={allowStretchGoals ? "Min amount" : "Amount"}
                    name={`${fieldName}.min`}
                    defaultValue={budgetItem.min}
                    inputProps={{ type: "number" }}
                    inputRef={register({ required: "Required", min: 0 })}
                  />
                </div>

                {allowStretchGoals && (
                  <div className="mr-2 my-2 sm:my-0">
                    <TextField
                      placeholder="Max amount"
                      name={`${fieldName}.max`}
                      defaultValue={budgetItem.max}
                      inputRef={register({ min: 0, required: "Required" })}
                    />
                  </div>
                )}
                <div className="my-2">
                  <IconButton onClick={() => removeExpenseRow(index)}>
                    <DeleteIcon className="h-6 w-6 text-color-red" />
                  </IconButton>
                </div>
              </div>
            );
          })}
          <div className="flex mb-2">
            <Button
              variant="secondary"
              onClick={addExpenseRow}
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
              {event.guidelines && (
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
