import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Box, Button, TextField, InputAdornment } from "@material-ui/core";

import Card from "../../styled/Card";
import thousandSeparator from "../../../utils/thousandSeparator";
import { UPDATE_GRANTING_SETTINGS } from "./";

const SetGrantValue = ({ closeModal, event }) => {
  const [updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register } = useForm();
  const recommendedGrantValue =
    event.totalBudget / (event.numberOfApprovedMembers * event.grantsPerMember);
  return (
    <Card>
      <Box p={3}>
        <h1>Set grant value</h1>

        <p>
          Recommended grant value calculated on{" "}
          {thousandSeparator(event.totalBudget)} {event.currency} in total
          budget, divided by {event.numberOfApprovedMembers} members and{" "}
          {event.grantsPerMember} grants per member:{" "}
          {recommendedGrantValue.toFixed(2)} {event.currency}
        </p>
        <form
          onSubmit={handleSubmit(variables => {
            updateGranting({
              variables: { grantValue: Number(variables.grantValue) }
            })
              .then(({ data }) => {
                // console.log({ data });
                closeModal();
              })
              .catch(err => {
                console.log({ err });
                alert(err.message);
              });
          })}
        >
          <Box m="15px 0">
            <TextField
              name="grantValue"
              label="Grant value"
              defaultValue={event.grantValue}
              fullWidth
              inputRef={register}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {event.currency}
                  </InputAdornment>
                )
              }}
              inputProps={{ type: "number", step: "1", min: "1" }}
              variant="outlined"
            />
          </Box>

          <Button
            type="submit"
            size="large"
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </form>
      </Box>
    </Card>
  );
};

export default SetGrantValue;
