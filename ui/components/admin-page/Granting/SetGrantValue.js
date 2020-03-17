import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Typography
} from "@material-ui/core";

import Card from "../../styled/Card";
import thousandSeparator from "../../../utils/thousandSeparator";
import { UPDATE_GRANTING_SETTINGS } from "./";

const SetGrantValue = ({ closeModal, event }) => {
  const [updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register } = useForm();
  const [prefunding, setPrefunding] = React.useState(0);
  const [numberOfMembers, setNumberOfMembers] = React.useState(
    event.numberOfApprovedMembers
  );
  const [maxParticipationRate, setMaxParticipationRate] = React.useState(100);

  const recommendedGrantValue =
    (event.totalBudget - prefunding) /
    (numberOfMembers * event.grantsPerMember * (maxParticipationRate / 100));

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Set grant value</h1>
        <Box my={1}>
          <TextField
            label="Grants per member"
            value={event.grantsPerMember}
            disabled
            fullWidth
          />
        </Box>
        <Box my={1}>
          <TextField
            label="Total budget"
            value={event.totalBudget}
            disabled
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{event.currency}</InputAdornment>
              ),
              type: "number"
            }}
          />
        </Box>
        <Box my={1}>
          <TextField
            label="Prefunding"
            value={prefunding}
            onChange={e => setPrefunding(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{event.currency}</InputAdornment>
              ),
              type: "number"
            }}
          />
        </Box>
        <Box my={1}>
          <TextField
            label="Number of members"
            value={numberOfMembers}
            onChange={e => setNumberOfMembers(e.target.value)}
            fullWidth
            InputProps={{
              type: "number"
            }}
          />
        </Box>
        <Box my={1}>
          <TextField
            label="Maximum expected participation rate"
            value={maxParticipationRate}
            onChange={e => setMaxParticipationRate(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>
            }}
            inputProps={{
              type: "number",
              min: "1",
              max: "100"
            }}
          />
        </Box>
        <Box my={1}>
          <Typography>
            Recommended grant value based on these parameters:{" "}
            <strong>
              {recommendedGrantValue.toFixed(2)} {event.currency}
            </strong>
          </Typography>
        </Box>
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
