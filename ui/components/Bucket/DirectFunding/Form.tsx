import Markdown from "components/Markdown";

const DirectFundingBucketForm = ({ bucket, round, exitEditing }) => {
  return (
    <>
      {round.directFundingTerms && (
        <Markdown source={round.directFundingTerms} enableMentions />
      )}
      <div onClick={exitEditing}>Save (make btn prettier)</div>
    </>
  );
};

export default DirectFundingBucketForm;
