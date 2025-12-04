import { Box, Button } from "@mui/material";
import { FormattedMessage } from "react-intl";
import Card from "components/styled/Card";

const SetAllowStretchGoals = ({ closeModal, round }) => {
  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage defaultMessage="Connect with Stripe" />
        </h1>
        <div className="mt-5">
          <FormattedMessage defaultMessage="Connect this round to Stripe to be able to enable direct funding of buckets by users." />
        </div>

        <div className="mt-9 mb-12">
          <h3 className="font-bold">
            <FormattedMessage defaultMessage="Stripe integration" />
          </h3>
          <div className="my-2">
            <FormattedMessage defaultMessage="Direct funds from all buckets will be sent to this Stripe account." />
          </div>
          <Button
            href={`/api/stripe/connect-round?roundId=${round.id}`}
            variant="contained"
            color="primary"
          >
            <FormattedMessage defaultMessage="Set up Stripe" />
          </Button>
        </div>

        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={() => closeModal()}
        >
          <FormattedMessage defaultMessage="Close" />
        </Button>
      </Box>
    </Card>
  );
};

export default SetAllowStretchGoals;
