import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import { Box, TextField, Button, Modal } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Card from "./styled/Card";
import { DREAM_QUERY } from "../pages/[dream]";
import { TOP_LEVEL_QUERY } from "../pages/_app";

const useStyles = makeStyles(theme => ({
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center"
  },
  innerModal: {
    outline: "none"
  }
}));

const PRE_OR_POST_FUND_MUTATION = gql`
  mutation PreOrPostFund($dreamId: ID!, $value: Int!) {
    preOrPostFund(dreamId: $dreamId, value: $value) {
      id
      value
    }
  }
`;

const GiveGrantlingsModal = ({ open, handleClose, dream, event }) => {
  const classes = useStyles();
  const router = useRouter();

  const [giveGrant] = useMutation(PRE_OR_POST_FUND_MUTATION, {
    update(cache, { data: { preOrPostFund } }) {
      const { dream } = cache.readQuery({
        query: DREAM_QUERY,
        variables: { slug: router.query.dream, eventId: event.id }
      });

      cache.writeQuery({
        query: DREAM_QUERY,
        data: {
          dream: {
            ...dream,
            currentNumberOfGrants:
              dream.currentNumberOfGrants + preOrPostFund.value
          }
        }
      });

      const topLevelQueryData = cache.readQuery({
        query: TOP_LEVEL_QUERY,
        variables: { slug: event.slug }
      });

      cache.writeQuery({
        query: TOP_LEVEL_QUERY,
        data: {
          ...topLevelQueryData,
          event: {
            ...topLevelQueryData.event,
            remainingGrants:
              topLevelQueryData.event.remainingGrants - preOrPostFund.value
          }
        }
      });
    }
  });
  const { handleSubmit, register } = useForm();

  const amountToReachMinGoal = Math.max(
    dream.minGoalGrants - dream.currentNumberOfGrants,
    0
  );

  const amountToReachMaxGoal =
    dream.maxGoalGrants - dream.currentNumberOfGrants;

  return (
    <Modal
      // aria-labelledby="simple-modal-title"
      // aria-describedby="simple-modal-description"
      open={open}
      onClose={handleClose}
      className={classes.modal}
    >
      <Card className={classes.innerModal}>
        <Box p={3}>
          <h1>Pre/post fund grants to dream</h1>
          <p>Available grants in event pool: {event.remainingGrants}</p>
          <p>Grantlings needed to reach minimum goal: {amountToReachMinGoal}</p>
          <p>Grantlings needed to reach maximum goal: {amountToReachMaxGoal}</p>
          {event.remainingGrants > amountToReachMinGoal ? (
            <form
              onSubmit={handleSubmit(variables => {
                giveGrant({
                  variables: {
                    dreamId: dream.id,
                    value: Number(variables.value)
                  }
                })
                  .then(data => {
                    // Add "Snackbar" success message from material UI
                    handleClose();
                  })
                  .catch(error => {
                    alert(error.message);
                  });
              })}
            >
              <Box m="15px 0">
                <TextField
                  name="value"
                  defaultValue={amountToReachMinGoal}
                  inputRef={register}
                  fullWidth
                  inputProps={{
                    type: "number",
                    min: `${Math.max(amountToReachMinGoal, 1)}`,
                    max: `${Math.min(
                      event.remainingGrants,
                      amountToReachMaxGoal
                    )}`
                  }}
                  variant="outlined"
                />
              </Box>
              <Button
                type="submit"
                size="large"
                fullWidth
                variant="contained"
                color="primary"
              >
                Allocate grantlings
              </Button>
            </form>
          ) : (
            <p>
              There is not enough grants left to reach this dreams minimum goal.
            </p>
          )}
        </Box>
      </Card>
    </Modal>
  );
};

export default GiveGrantlingsModal;
