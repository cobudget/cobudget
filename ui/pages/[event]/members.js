import Members from "../../components/EventMembers";
import SubMenu from "../../components/SubMenu";
import PageHero from "../../components/PageHero";

const EventMembersPage = ({ event, currentOrgMember }) => {
  const isEventMember =
    currentOrgMember?.currentEventMembership || currentOrgMember?.isOrgAdmin;
  if (!event) return null;
  if (!isEventMember)
    return (
      <div className="flex-1">
        <SubMenu currentOrgMember={currentOrgMember} event={event} />
        <PageHero>
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">
              You need to be a member of this event to see the member list.
            </h2>
          </div>
        </PageHero>
      </div>
    );
  return (
    <div className="flex-1">
      <SubMenu currentOrgMember={currentOrgMember} event={event} />
      <Members event={event} />
    </div>
  );
};

export default EventMembersPage;
