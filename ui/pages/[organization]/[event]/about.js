import { gql } from "@apollo/client";

import About from "components/About";
import SubMenu from "components/SubMenu";
import PageHero from "components/PageHero";
import EditableField from "components/EditableField";

export default function AboutPage({
  router,
  event,
  currentOrgMember,
  currentOrg,
}) {
  if (!event) return null;
  return (
    <>
      <SubMenu currentOrgMember={currentOrgMember} event={event} />
      <PageHero>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          <div className="col-span-2">
            <EditableField
              value={event.about}
              label="Add about text"
              placeholder={`# About ${event.title}`}
              canEdit={
                currentOrgMember?.isOrgAdmin ||
                currentOrgMember?.currentEventMembership?.isAdmin
              }
              name="about"
              className="h-10"
              MUTATION={gql`
                mutation EditEventAbout($eventId: ID!, $about: String) {
                  editEvent(eventId: $eventId, about: $about) {
                    id
                    about
                  }
                }
              `}
              variables={{ eventId: event.id }}
            />
          </div>
        </div>
      </PageHero>
      <div className="page">
        <About router={router} currentOrg={currentOrg} />
      </div>
    </>
  );
}
