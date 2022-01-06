import { stringToColor } from "utils/stringToHslColor";
import { isMemberOfDream } from "utils/helpers";

import Label from "components/Label";
import Monster from "../Monster";

import Images from "./Images";
import Comments from "./Comments";
import Budget from "./Budget";
import Summary from "./Summary";
import Title from "./Title";
import Description from "./Description";
import DreamCustomFields from "./CustomFields/DreamCustomFields";
import Sidebar from "./Sidebar";

const Bucket = ({ bucket, collection, currentUser, currentOrg }) => {
  const canEdit =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator ||
    isMemberOfDream(currentUser, bucket);
  const showBucketReview =
    currentUser?.currentCollMember?.isApproved &&
    collection.bucketReviewIsOpen &&
    collection.guidelines.length > 0 &&
    bucket.published;

  return (
    <div className="bg-white border-b-default">
      <div className="page relative">
        {showBucketReview && (
          <Monster event={collection} bucket={bucket} currentOrg={currentOrg} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-sidebar gap-10">
          <div className="py-2">
            <Images
              images={bucket.images}
              size={100}
              canEdit={canEdit}
              bucketId={bucket.id}
            />

            {bucket.description && (
              <Description
                // We no longer use this field for new dreams.
                // Eventually we will migrate all current descriptions to custom fields.
                description={bucket.description}
                bucketId={bucket.id}
                canEdit={canEdit}
              />
            )}

            <DreamCustomFields
              collectionId={collection.id}
              bucketId={bucket.id}
              customFields={bucket.customFields}
              canEdit={canEdit}
            />

            <Budget
              bucketId={bucket.id}
              budgetItems={bucket.budgetItems}
              canEdit={canEdit}
              currency={collection.currency}
              allowStretchGoals={collection.allowStretchGoals}
              collection={collection}
              currentOrg={currentOrg}
              minGoal={bucket.minGoal}
              maxGoal={bucket.maxGoal}
            />

            {/* <hr className="mb-4 mt-1" />
            <Comments
              currentUser={currentUser}
              currentOrg={currentOrg}
              bucket={bucket}
              collection={collection}
            /> */}
          </div>
          {/* <div className="order-first md:order-last">
            <Sidebar
              bucket={bucket}
              collection={collection}
              currentUser={currentUser}
              canEdit={canEdit}
              currentOrg={currentOrg}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Bucket;
