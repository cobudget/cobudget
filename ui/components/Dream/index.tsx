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

const Dream = ({ dream, collection, currentUser, currentOrg }) => {
  const canEdit =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator ||
    isMemberOfDream(currentUser, dream);
  const showBucketReview =
    currentUser?.currentCollMember?.isApproved &&
    collection.bucketReviewIsOpen &&
    collection.guidelines.length > 0 &&
    dream.published;

  return (
    <div className="bg-white border-b-default">
      <div className="page relative">
        {showBucketReview && (
          <Monster event={collection} dream={dream} currentOrg={currentOrg} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-sidebar gap-10">
          <div className="py-2">
            <Images
              images={dream.images}
              size={100}
              canEdit={canEdit}
              bucketId={dream.id}
            />

            {dream.description && (
              <Description
                // We no longer use this field for new dreams.
                // Eventually we will migrate all current descriptions to custom fields.
                description={dream.description}
                bucketId={dream.id}
                canEdit={canEdit}
              />
            )}

            <DreamCustomFields
              collectionId={collection.id}
              bucketId={dream.id}
              customFields={dream.customFields}
              canEdit={canEdit}
            />

            <Budget
              bucketId={dream.id}
              budgetItems={dream.budgetItems}
              canEdit={canEdit}
              currency={collection.currency}
              allowStretchGoals={collection.allowStretchGoals}
              collection={collection}
              currentOrg={currentOrg}
              minGoal={dream.minGoal}
              maxGoal={dream.maxGoal}
            />

            {/* <hr className="mb-4 mt-1" />
            <Comments
              currentUser={currentUser}
              currentOrg={currentOrg}
              dream={dream}
              collection={collection}
            /> */}
          </div>
          {/* <div className="order-first md:order-last">
            <Sidebar
              dream={dream}
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

export default Dream;
