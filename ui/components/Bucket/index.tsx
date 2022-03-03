import { isMemberOfBucket } from "utils/helpers";

import Images from "./Images";
import Budget from "./Budget";
import Description from "./Description";
import BucketCustomFields from "./CustomFields/BucketCustomFields";

const Bucket = ({
  bucket,
  round,
  currentUser,
  currentOrg,
  openImageModal,
}) => {
  if (!bucket) return null;

  const canEdit =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator ||
    isMemberOfBucket(currentUser, bucket);
  return (
    <div className="bg-white border-b-default">
      <div className="page relative">
        <div className="grid grid-cols-1 md:grid-cols-sidebar gap-10">
          <div className="py-2">
            <Images
              images={bucket.images}
              size={100}
              canEdit={canEdit}
              bucketId={bucket.id}
              openImageModal={openImageModal}
            />

            {bucket.description && (
              <Description
                // We no longer use this field for new buckets.
                // Eventually we will migrate all current descriptions to custom fields.
                description={bucket.description}
                bucketId={bucket.id}
                canEdit={canEdit}
              />
            )}

            <BucketCustomFields
              roundId={round.id}
              bucketId={bucket.id}
              customFields={bucket.customFields}
              canEdit={canEdit}
            />

            <Budget
              bucketId={bucket.id}
              budgetItems={bucket.budgetItems}
              canEdit={canEdit}
              currency={round.currency}
              allowStretchGoals={round.allowStretchGoals}
              round={round}
              currentOrg={currentOrg}
              minGoal={bucket.minGoal}
              maxGoal={bucket.maxGoal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bucket;
