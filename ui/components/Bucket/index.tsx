import { isMemberOfBucket } from "utils/helpers";

import Images from "./Images";
import Budget from "./Budget";
import Description from "./Description";
import BucketCustomFields from "./CustomFields/BucketCustomFields";
import DirectFunding from "./DirectFunding";
import toast from "react-hot-toast";

const Bucket = ({ bucket, currentUser, openImageModal }) => {
  if (!bucket) return null;

  const canEdit =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator ||
    isMemberOfBucket(currentUser, bucket);

  const cocreatorsEditableStatuses = [
    "PENDING_APPROVAL",
    "IDEA",
    "FUNDED",
    "COMPLETED",
  ];

  const isEditingAllowed =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator ||
    (isMemberOfBucket(currentUser, bucket) &&
      (bucket.round.canCocreatorEditOpenBuckets
        ? true
        : cocreatorsEditableStatuses.indexOf(bucket.status) > -1));

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
              openImageModal={() => {
                if (isEditingAllowed) {
                  openImageModal();
                } else {
                  toast.error(
                    "Funding has started, and you cannot edit your bucket. Please contact a moderator or admin for help."
                  );
                }
              }}
            />

            {bucket.description && (
              <Description
                // We no longer use this field for new buckets.
                // Eventually we will migrate all current descriptions to custom fields.
                description={bucket.description || ""}
                bucketId={bucket.id}
                canEdit={canEdit}
              />
            )}

            <BucketCustomFields
              roundId={bucket.round.id}
              bucketId={bucket.id}
              customFields={bucket.customFields}
              canEdit={canEdit}
              isEditingAllowed={isEditingAllowed}
            />

            <Budget
              bucket={bucket}
              canEdit={canEdit}
              currency={bucket.round.currency}
              allowStretchGoals={bucket.round.allowStretchGoals}
              minGoal={bucket.minGoal}
              maxGoal={bucket.maxGoal}
              isEditingAllowed={isEditingAllowed}
            />

            <DirectFunding
              canEdit={canEdit}
              round={bucket.round}
              isEditingAllowed={isEditingAllowed}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bucket;
