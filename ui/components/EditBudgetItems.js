import {
  TextField,
  Box,
  InputAdornment,
  Button,
  Typography
} from "@material-ui/core";
import { Delete as DeleteIcon, Add as AddIcon } from "@material-ui/icons";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  row: {
    margin: "16px 0",
    display: "grid",
    gridTemplateColumns: "8fr 6fr 2fr",
    gridGap: theme.spacing(2)
  },
  [theme.breakpoints.down("xs")]: {
    row: {
      gridTemplateColumns: "1fr"
    }
  }
}));

export default ({
  event,
  register,
  errors,
  budgetItems,
  addBudgetItem,
  removeBudgetItem
}) => {
  const classes = useStyles();

  return (
    <Box my={2}>
      <Typography variant="h6">Budget items</Typography>
      {budgetItems.map((budgetItem, index) => {
        const fieldName = `budgetItems[${index}]`;
        return (
          <div className={classes.row} key={fieldName}>
            <TextField
              name="description"
              label="Description"
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
            <TextField
              name="amount"
              label="Amount"
              name={`${fieldName}.amount`}
              defaultValue={budgetItem.amount}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {event.currency}
                  </InputAdornment>
                )
              }}
              inputRef={register({ required: "Required" })}
              variant="outlined"
              error={Boolean(errors[`${fieldName}.amount`])}
              helperText={
                errors[`${fieldName}.amount`] &&
                errors[`${fieldName}.amount`].message
              }
            />
            <Button
              onClick={() => removeBudgetItem(index)}
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
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
