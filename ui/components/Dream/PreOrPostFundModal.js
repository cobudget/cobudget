import { useForm } from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import { Box, TextField, Button, Modal } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { DREAM_QUERY } from "../../pages/[event]/[dream]";
import { TOP_LEVEL_QUERY } from "../../pages/_app";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center",
  },
  innerModal: {
    outline: "none",
  },
}));

const PRE_OR_POST_FUND_MUTATION = gql`
  mutation PreOrPostFund($dreamId: ID!, $value: Int!) {
    preOrPostFund(dreamId: $dreamId, value: $value) {
      id
      value
    }
  }
`;

const PreOrPostFundModal = ({ open, handleClose, dream, event }) => {
  const classes = useStyles();
  const router = useRouter();

  const dreamId = dream.id;

  const [giveGrant] = useMutation(PRE_OR_POST_FUND_MUTATION, {
    update(cache, { data: { preOrPostFund } }) {
      const { dream } = cache.readQuery({
        query: DREAM_QUERY,
        variables: { id: dreamId },
      });

      cache.writeQuery({
        query: DREAM_QUERY,
        variables: { id: dreamId },
        data: {
          dream: {
            ...dream,
            currentNumberOfGrants:
              dream.currentNumberOfGrants + preOrPostFund.value,
          },
        },
      });

      const topLevelQueryData = cache.readQuery({
        query: TOP_LEVEL_QUERY,
        variables: { slug: event.slug },
      });

      cache.writeQuery({
        query: TOP_LEVEL_QUERY,
        data: {
          ...topLevelQueryData,
          event: {
            ...topLevelQueryData.event,
            remainingGrants:
              topLevelQueryData.event.remainingGrants - preOrPostFund.value,
          },
        },
      });
    },
  });
  const { handleSubmit, register } = useForm();

  const amountToReachMinGoal = Math.max(
    dream.minGoalGrants - dream.currentNumberOfGrants,
    0
  );

  const amountToReachMaxGoal =
    Math.max(dream.maxGoalGrants, dream.minGoalGrants) -
    dream.currentNumberOfGrants;

  return (
    <Modal open={open} onClose={handleClose} className={classes.modal}>
      <div className="p-5 bg-white rounded-lg shadow-md overflow-hidden outline-none">
        <h1 className="text-3xl mb-2 font-medium">
          {event.grantingHasClosed ? "Post" : "Pre"}-fund dream
        </h1>
        <p>Available grants in event pool: {event.remainingGrants}</p>
        <p>Grantlings needed to reach minimum goal: {amountToReachMinGoal}</p>
        <p>Grantlings needed to reach maximum goal: {amountToReachMaxGoal}</p>
        {event.remainingGrants > amountToReachMinGoal ? (
          <form
            onSubmit={handleSubmit((variables) => {
              giveGrant({
                variables: {
                  dreamId: dream.id,
                  value: Number(variables.value),
                },
              })
                .then((data) => {
                  // Add "Snackbar" success message from material UI
                  handleClose();
                })
                .catch((error) => {
                  alert(error.message);
                });
            })}
          >
            <div className="my-3">
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
                  )}`,
                }}
                variant="outlined"
              />
            </div>
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
      </div>
    </Modal>
  );
};

export default PreOrPostFundModal;
