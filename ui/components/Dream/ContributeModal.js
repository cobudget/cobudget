import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Modal } from "@material-ui/core";
import Button from "components/Button";
import TextField from "components/TextField";

import { TOP_LEVEL_QUERY } from "../../pages/_app";

const CONTRIBUTE_MUTATION = gql`
  mutation Contribute($eventId: ID!, $dreamId: ID!, $amount: Int!) {
    contribute(eventId: $eventId, dreamId: $dreamId, amount: $amount) {
      id
      totalContributions
    }
  }
`;

const ContributeModal = ({ handleClose, dream, event, currentOrgMember }) => {
  const [inputValue, setInputValue] = useState("");
  const amount = Math.round(inputValue * 100);

  const [contribute, { loading }] = useMutation(CONTRIBUTE_MUTATION, {
    variables: { eventId: event.id, dreamId: dream.id, amount },
    update(cache) {
      const topLevelQueryData = cache.readQuery({
        query: TOP_LEVEL_QUERY,
        variables: { slug: event.slug },
      });

      cache.writeQuery({
        query: TOP_LEVEL_QUERY,
        variables: { slug: event.slug },
        data: {
          ...topLevelQueryData,
          currentOrgMember: {
            ...topLevelQueryData.currentOrgMember,
            currentEventMembership: {
              ...topLevelQueryData.currentOrgMember.currentEventMembership,
              balance:
                topLevelQueryData.currentOrgMember.currentEventMembership
                  .balance - amount,
            },
          },
        },
      });
    },
  });

  const amountToMaxGoal =
    Math.max(dream.minGoal, dream.maxGoal) - dream.totalContributions;

  const memberBalance = currentOrgMember.currentEventMembership.balance;

  const max = event.maxAmountToDreamPerUser
    ? Math.min(amountToMaxGoal, memberBalance, event.maxAmountToDreamPerUser)
    : Math.min(amountToMaxGoal, memberBalance);

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-sm">
        <h1 className="text-2xl mb-2 font-semibold">
          Contribute to {dream.title}
        </h1>
        <p className="text-gray-800">
          Available balance:{" "}
          {currentOrgMember.currentEventMembership.balance / 100}{" "}
          {event.currency}
        </p>
        {event.maxAmountToDreamPerUser && (
          <p className="text-sm text-gray-600 my-2">
            Max. {event.maxAmountToDreamPerUser / 100} {event.currency} to one
            dream
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            contribute()
              .then(() => handleClose())
              .catch((err) => alert(err.message));
          }}
        >
          <TextField
            fullWidth
            className="my-3"
            autoFocus
            placeholder="0"
            endAdornment={event.currency}
            size="large"
            color={event.color}
            inputProps={{
              value: inputValue,
              onChange: (e) => setInputValue(e.target.value),
              type: "number",
              min: "0",
              max: `${max / 100}`,
              step: 0.01,
            }}
          />
          <Button
            type="submit"
            size="large"
            fullWidth
            color={event.color}
            loading={loading}
            disabled={amount <= 0}
            className="my-2"
          >
            Fund
          </Button>
          <Button
            size="large"
            fullWidth
            variant="secondary"
            color={event.color}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default ContributeModal;
