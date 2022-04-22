import { useMutation } from "urql";

import { Box, Button } from "@material-ui/core";

import Card from "components/styled/Card";

import { UPDATE_GRANTING_SETTINGS } from ".";

const SetAllowStretchGoals = ({ closeModal, round }) => {
  // TODO: create mutation for getting link to redirect user to
  //const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Connect with Stripe</h1>
        <div className="mt-5">
          Connect this round to Stripe to be able to enable direct funding of
          buckets by users.
        </div>

        <div className="mt-9 mb-12">
          <h3 className="font-bold">Stripe integration</h3>
          <div className="my-2">
            Direct funds from all buckets will be sent to this Stripe account.
          </div>
          <Button
            href={`/api/stripe/connect-round?roundId=${round.id}`}
            variant="contained"
            color="primary"
          >
            Set up Stripe
          </Button>
        </div>

        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={() => closeModal()}
        >
          Close
        </Button>
      </Box>
    </Card>
  );
};

export default SetAllowStretchGoals;
