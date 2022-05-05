import { useState } from "react";
import toast from "react-hot-toast";
import Markdown from "components/Markdown";
import Button from "components/Button";
import SelectInput from "components/SelectInput";

const DirectFundingBucketForm = ({
  bucket,
  editBucket,
  fetchingMutation,
  round,
  exitEditing,
}) => {
  const [directFundingType, setDirectFundingType] = useState<string>(
    bucket.directFundingType
  );

  return (
    <>
      {round.directFundingTerms && (
        <Markdown
          source={round.directFundingTerms}
          enableMentions
          className="mt-5"
        />
      )}
      <div className="font-bold my-5">
        Select whether funds are a donation or in exchange for goods or services
      </div>
      <SelectInput
        fullWidth
        value={directFundingType}
        onChange={(e) => setDirectFundingType(e.target.value)}
      >
        <option value="DONATION">Funds received are donations.</option>
        <option value="EXCHANGE">
          We are offering goods or services in exchange for funds.
        </option>
      </SelectInput>
      <Button
        className="mt-8"
        color={round.color}
        loading={fetchingMutation}
        onClick={() => {
          editBucket({ bucketId: bucket.id, directFundingType }).then(
            ({ error }) => {
              if (error) {
                console.error(error);
                toast.error(error.message);
              } else {
                exitEditing();
              }
            }
          );
        }}
      >
        Save
      </Button>
    </>
  );
};

export default DirectFundingBucketForm;
