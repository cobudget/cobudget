import { useState } from "react";
import { useMutation } from "urql";
import { Box, Button } from "@material-ui/core";
import { Tooltip } from "react-tippy";

import SelectInput from "components/SelectInput";
import Card from "components/styled/Card";
import Wysiwyg from "components/Wysiwyg";

import { UPDATE_GRANTING_SETTINGS } from ".";

const SetAllowStretchGoals = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const [directFundingEnabled, setDirectFundingEnabled] = useState<boolean>(
    round.directFundingEnabled
  );
  const [directFundingTerms, setDirectFundingTerms] = useState<string>(
    round.directFundingTerms
  );

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Accept direct funding</h1>
        <div className="mt-5">
          Allow bucket co-creators to receive funds directly via Stripe.
          Co-creators will be asked to specify if direct funds are donations or
          in exchange for goods or services.
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            updateGranting({
              roundId: round.id,
              directFundingEnabled,
              directFundingTerms,
            }).then(({ error }) => {
              if (error) {
                console.error({ error });
                alert(error.message);
              } else {
                closeModal();
              }
            });
          }}
        >
          <Box m="15px 0">
            <Tooltip
              title={
                !round.stripeIsConnected
                  ? "You need to connect this round to Stripe first"
                  : ""
              }
            >
              <SelectInput
                label="Accept direct funding"
                fullWidth
                value={directFundingEnabled ? "true" : "false"}
                disabled={!round.stripeIsConnected}
                onChange={(e) =>
                  setDirectFundingEnabled(e.target.value === "true")
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </SelectInput>
            </Tooltip>
          </Box>

          {directFundingEnabled && (
            <div className="my-7">
              <h3 className="font-bold">Message to bucket co-creators</h3>
              <div className="my-2">
                Describe what they need to know to set up and manage direct
                funding for their bucket.
              </div>
              <Wysiwyg
                defaultValue={directFundingTerms}
                onChange={(e) => setDirectFundingTerms(e.target.value)}
                rows={4}
                highlightColor={round.color}
              />
            </div>
          )}

          <Button
            type="submit"
            size="large"
            variant="contained"
            color="primary"
          >
            Save
          </Button>

          {directFundingEnabled && (
            <div className="mt-5 text-gray-600">
              If a bucket is not fully funded, direct funds will be
              automatically refunded via Stripe to the funder.
            </div>
          )}
        </form>
      </Box>
    </Card>
  );
};

export default SetAllowStretchGoals;
