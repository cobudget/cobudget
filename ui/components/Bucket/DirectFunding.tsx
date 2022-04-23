const DirectFunding = ({ canEdit = false, round }) => {
  const enableDirectFundingForBucket = () =>
    console.log("enabling direct funding");

  if (!canEdit || !round.directFundingEnabled) return null;

  return (
    <button
      onClick={() => enableDirectFundingForBucket()}
      className="block w-full h-32 text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
    >
      + Direct funding
    </button>
  );
};

export default DirectFunding;
