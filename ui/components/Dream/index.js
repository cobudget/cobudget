import stringToHslColor, { stringToColor } from "utils/stringToHslColor";
import { isMemberOfDream } from "utils/helpers";

import Label from "components/Label";

import Images from "./Images";
import Comments from "./Comments";
import Budget from "./Budget";
import Summary from "./Summary";
import Title from "./Title";
import Description from "./Description";
import DreamCustomFields from "./CustomFields/DreamCustomFields";
import Sidebar from "./Sidebar";

const Dream = ({ dream, event, currentUser }) => {
  const canEdit =
    currentUser?.membership?.isAdmin ||
    currentUser?.membership?.isGuide ||
    isMemberOfDream(currentUser, dream);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {!dream.published && (
        <Label className="absolute right-0 m-5 text-sm">Unpublished</Label>
      )}
      {dream.images.length > 0 ? (
        <img
          className="h-64 md:h-88 w-full object-cover object-center"
          src={dream.images[0].large ?? dream.images[0].small}
        />
      ) : (
        <div
          className={`h-64 md:h-88 w-full bg-${stringToColor(dream.title)}`}
        />
      )}

      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-sidebar gap-2 md:gap-6 relative">
          <div>
            <Title title={dream.title} dreamId={dream.id} canEdit={canEdit} />
            {dream.customFields && dream.customFields.electricity}
            <Summary
              dreamId={dream.id}
              summary={dream.summary}
              canEdit={canEdit}
            />

            <Images
              images={dream.images}
              size={100}
              canEdit={canEdit}
              dreamId={dream.id}
            />

            <Description
              description={dream.description}
              dreamId={dream.id}
              canEdit={canEdit}
            />

            <DreamCustomFields
              eventId={event.id}
              dreamId={dream.id}
              customFields={dream.customFields}
              canEdit={canEdit}
            />

            <Budget
              dreamId={dream.id}
              budgetItems={dream.budgetItems}
              canEdit={canEdit}
              currency={event.currency}
              allowStretchGoals={event.allowStretchGoals}
              event={event}
              minGoal={dream.minGoal}
              maxGoal={dream.maxGoal}
            />

            <hr className="mb-4 mt-1" />

            <Comments
              currentUser={currentUser}
              comments={dream.comments}
              dreamId={dream.id}
            />
          </div>
          <div className="order-first md:order-last">
            <Sidebar
              dream={dream}
              event={event}
              currentUser={currentUser}
              canEdit={canEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dream;
