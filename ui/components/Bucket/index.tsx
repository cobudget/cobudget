import { isMemberOfBucket } from "utils/helpers";

import Images from "./Images";
import Budget from "./Budget";
import Description from "./Description";
import BucketCustomFields from "./CustomFields/BucketCustomFields";
import DirectFunding from "./DirectFunding";

const Bucket = ({ bucket, currentUser, openImageModal }) => {
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
              roundId={bucket.round.id}
              bucketId={bucket.id}
              customFields={bucket.customFields}
              canEdit={canEdit}
            />

            <Budget
              bucket={bucket}
              canEdit={canEdit}
              currency={bucket.round.currency}
              allowStretchGoals={bucket.round.allowStretchGoals}
              minGoal={bucket.minGoal}
              maxGoal={bucket.maxGoal}
            />

            <DirectFunding canEdit={canEdit} round={round} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bucket;
