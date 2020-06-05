import {
  TextField,
  Box,
  InputAdornment,
  Button,
  IconButton,
  Typography,
} from "@material-ui/core";
import { Delete as DeleteIcon, Add as AddIcon } from "@material-ui/icons";

export default ({
  event,
  register,
  errors,
  budgetItems,
  addBudgetItem,
  removeBudgetItem,
}) => {
  return (
    <Box my={2}>
      <Typography variant="h6">Budget items</Typography>
      {budgetItems.map((budgetItem, index) => {
        const fieldName = `budgetItems[${index}]`;
        return (
          <div className={`flex flex-col sm:flex-row my-4`} key={fieldName}>
            <div className="mr-2 my-2 sm:my-0 flex-grow">
              <TextField
                name="description"
                label="Description"
                fullWidth
                name={`${fieldName}.description`}
                defaultValue={budgetItem.description}
                inputRef={register({ required: "Required" })}
                variant="outlined"
                error={Boolean(errors[`${fieldName}.description`])}
                helperText={
                  errors[`${fieldName}.description`] &&
                  errors[`${fieldName}.description`].message
                }
              />
            </div>
            <div className="mr-2 my-2 sm:my-0">
              <TextField
                name="min"
                label={event.allowStretchGoals ? "Min amount" : "Amount"}
                fullWidth
                name={`${fieldName}.min`}
                defaultValue={budgetItem.min}
                inputProps={{ type: "number" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {event.currency}
                    </InputAdornment>
                  ),
                }}
                inputRef={register({ required: "Required", min: 0 })}
                variant="outlined"
                error={Boolean(errors[`${fieldName}.min`])}
                helperText={
                  errors[`${fieldName}.min`] &&
                  errors[`${fieldName}.min`].message
                }
              />
            </div>

            {event.allowStretchGoals && (
              <div className="mr-2 my-2 sm:my-0">
                <TextField
                  name="max"
                  label="Max amount"
                  fullWidth
                  name={`${fieldName}.max`}
                  defaultValue={budgetItem.max}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {event.currency}
                      </InputAdornment>
                    ),
                  }}
                  inputRef={register({ min: 0 })}
                  variant="outlined"
                  error={Boolean(errors[`${fieldName}.max`])}
                  helperText={
                    errors[`${fieldName}.max`] &&
                    errors[`${fieldName}.max`].message
                  }
                />
              </div>
            )}
            <div className="my-2 sm:my-0">
              <IconButton onClick={() => removeBudgetItem(index)}>
                <DeleteIcon />
              </IconButton>
            </div>
          </div>
        );
      })}
      <Box my={1}>
        <Button size="large" startIcon={<AddIcon />} onClick={addBudgetItem}>
          Add budget item
        </Button>
      </Box>
    </Box>
  );
};
