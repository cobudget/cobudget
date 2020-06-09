import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { useForm } from "react-hook-form";
import {
  TextField as OldTextField,
  Box,
  InputAdornment,
  Button as OldButton,
  IconButton as OldIconButton,
  Typography,
  Modal,
} from "@material-ui/core";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { DeleteIcon, AddIcon } from "components/Icons";
import { Delete as OldDeleteIcon, Add as OldAddIcon } from "@material-ui/icons";

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
      }
    }
  }
`;

const schema = yup.object().shape({
  budgetItems: yup.array().of(
    yup.object().shape({
      description: yup.string().required(),
      min: yup.number().positive().integer().required(),
      max: yup.number().positive().integer(),
    })
  ),
});

export default ({
  dreamId,
  initialBudgetItems,
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

  const emptyBudgetItem = { description: "", min: 0, max: 0 };

  const [budgetItems, setBudgetItems] = useState(
    initialBudgetItems.length ? initialBudgetItems : [emptyBudgetItem]
  );

  const addBudgetItem = () => setBudgetItems([...budgetItems, emptyBudgetItem]);
  const removeBudgetItem = (i) =>
    setBudgetItems([...budgetItems.filter((item, index) => i !== index)]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-md">
        <h1 className="text-xl font-semibold">Edit budget</h1>

        <form
          onSubmit={handleSubmit((variables) =>
            editDream({ variables })
              .then((data) => {
                console.log({ data });
                handleClose();
              })
              .catch((err) => alert(err.message))
          )}
        >
          {budgetItems.map((budgetItem, index) => {
            const fieldName = `budgetItems[${index}]`;
            return (
              <div className={`flex flex-col sm:flex-row my-2`} key={fieldName}>
                <div className="mr-2 my-2 sm:my-0 flex-grow">
                  <TextField
                    placeholder="Description"
                    name={`${fieldName}.description`}
                    defaultValue={budgetItem.description}
                    inputRef={register({
                      required: "Required",
                    })}
                    // error={Boolean(
                    //   errors.budgetItems && errors.budgetItems[index]?.description
                    // )}
                    // helperText={
                    //   errors.budgetItems &&
                    //   errors.budgetItems[index]?.description?.message
                    // }
                  />
                </div>
                {/* // errors.budgetItems[2].description */}

                <div className="mr-2 my-2 sm:my-0">
                  <TextField
                    placeholder={allowStretchGoals ? "Min amount" : "Amount"}
                    name={`${fieldName}.min`}
                    defaultValue={budgetItem.min}
                    inputProps={{ type: "number" }}
                    // InputProps={{
                    //   endAdornment: (
                    //     <InputAdornment position="end">{currency}</InputAdornment>
                    //   ),
                    // }}
                    inputRef={register({ required: "Required", min: 0 })}
                    // error={Boolean(
                    //   errors.budgetItems && errors.budgetItems[index]?.min
                    // )}
                    // helperText={
                    //   errors.budgetItems &&
                    //   errors.budgetItems[index]?.min?.message
                    // }
                  />
                </div>

                {allowStretchGoals && (
                  <div className="mr-2 my-2 sm:my-0">
                    <TextField
                      placeholder="Max amount"
                      name={`${fieldName}.max`}
                      defaultValue={budgetItem.max}
                      // InputProps={{
                      //   endAdornment: (
                      //     <InputAdornment position="end">
                      //       {currency}
                      //     </InputAdornment>
                      //   ),
                      // }}
                      inputRef={register({ min: 0, required: "Required" })}
                      // error={Boolean(
                      //   errors.budgetItems && errors.budgetItems[index]?.max
                      // )}
                      // helperText={
                      //   errors.budgetItems &&
                      //   errors.budgetItems[index]?.max?.message
                      // }
                    />
                  </div>
                )}
                <div className="my-2">
                  <IconButton onClick={() => removeBudgetItem(index)}>
                    <DeleteIcon className="h-6 w-6 text-color-red" />
                  </IconButton>
                </div>
              </div>
            );
          })}
          <div className="flex mb-2">
            <Button
              variant="secondary"
              onClick={addBudgetItem}
              className="flex-grow"
            >
              <AddIcon className="h-5 w-5 mr-1" /> Add row
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <div className="pl-4">
              {event.guidelines && (
                <a
                  href={`/${event.slug}/granting#guidelines`}
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
