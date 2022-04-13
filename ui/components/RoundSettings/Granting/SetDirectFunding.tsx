import { useForm } from "react-hook-form";
import { useMutation } from "urql";

import { Box, Button } from "@material-ui/core";

import SelectInput from "components/SelectInput";
import Card from "components/styled/Card";

import { UPDATE_GRANTING_SETTINGS } from ".";
import Wysiwyg from "components/Wysiwyg";
import { useState } from "react";

const SetAllowStretchGoals = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register, watch } = useForm();
  const [directFundingTerms, setDirectFundingTerms] = useState<string>(
    round.directFundingTerms
  );

  const directFundingEnabled = watch("directFundingEnabled") === "true";

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
          onSubmit={handleSubmit(() => {
            updateGranting({
              roundId: round.id,
              directFundingEnabled,
              directFundingTerms,
            }).then(({ error }) => {
              if (error) {
                console.error({ error });
                alert(error.message);
              }
              closeModal();
            });
          })}
        >
          <Box m="15px 0">
            <SelectInput
              name="directFundingEnabled"
              label="Accept direct funding"
              defaultValue={round.directFundingEnabled ?? false}
              inputRef={register}
              fullWidth
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </SelectInput>
          </Box>

          {directFundingEnabled && (
            <div>
              <div className="my-7">
                <h3 className="font-bold">Stripe integration</h3>
                <div className="my-2">
                  Direct funds from all buckets will be sent to this Stripe
                  account.
                </div>
                <Button
                  onClick={() => console.log("click stripe")}
                  variant="contained"
                  color="primary"
                >
                  Set up Stripe
                </Button>
              </div>
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
            <div className="mt-5">
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
