import { useForm } from "react-hook-form";
import { useMutation } from "urql";

import { Box, Button } from "@material-ui/core";

import SelectInput from "components/SelectInput";
import Card from "components/styled/Card";

import { UPDATE_GRANTING_SETTINGS } from ".";

const SetRequireBucketApproval = ({ closeModal, collection }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register } = useForm();
  console.log({ collection });
  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Require bucket approval</h1>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              collectionId: collection.id,
              requireBucketApproval: variables.requireBucketApproval === "true",
            })
              .then(({ data }) => {
                console.log({ data });
                closeModal();
              })
              .catch((err) => {
                console.log({ err });
                alert(err.message);
              });
          })}
        >
          <Box m="15px 0">
            <SelectInput
              name="requireBucketApproval"
              label="Require bucket approval"
              defaultValue={collection.requireBucketApproval ?? false}
              inputRef={register}
              fullWidth
            >
              <option value={true}>true</option>
              <option value={false}>false</option>
            </SelectInput>
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

export default SetRequireBucketApproval;
