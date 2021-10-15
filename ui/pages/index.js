import { forwardRef } from "react";
import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import Button from "components/Button";
import TodoList from "components/TodoList";
import { AddIcon } from "components/Icons";
import Label from "components/Label";
import SubMenu from "components/SubMenu";
import PageHero from "components/PageHero";
import dreamName from "utils/dreamName";
import EditableField from "components/EditableField";

const EVENTS_QUERY = gql`
  query Events {
    events {
      id
      slug
      title
      archived
      color
    }
  }
`;

const LandingPage = () => {
  return (
    <div className="page">
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h1 className="text-6xl font-medium">
            Digital tools for participant-driven culture
          </h1>
          <p className="text-xl text-gray-800">
            Plato tools help you gather ideas, take decisions, map needs,
            budgets and areas of responsibility, and provide a socially focused
            digital meeting place for the participants.
          </p>
          <Link href="/organizations/create">
            <Button color="anthracit" size="large">
              Create a Community
            </Button>
          </Link>
          <p className="text-sm text-gray-800">
            Plato is in open beta. Organizations already use it, but we are
            still working on getting things just right. If you need Plato for a
            mission-critical project, please get in touch at{" "}
            <a
              className="text-black underline"
              href="mailto:info@platoproject.org"
            >
              info@platoproject.org
            </a>
            . Plato is currently free for small non-profits. If you need Plato
            for your business or large organization, let’s talk!
          </p>
        </div>
        <img className="" src="/frihamnstorget.jpeg" />
      </div>
    </div>
  );
};

const LinkCard = forwardRef((props, ref) => {
  const { color, className, children } = props;
  return (
    <a
      {...props}
      className={
        `bg-${color} ` +
        `ring-${color}-dark hover:ring ` +
        "cursor-pointer group p-4 font-medium rounded-md text-white flex justify-between items-start transitions-shadows duration-75" +
        " " +
        (className ? className : "h-32")
      }
      ref={ref}
    >
      {children}
    </a>
  );
});

const IndexPage = ({ currentOrg, currentOrgMember }) => {
  const { data: { events } = { events: [] } } = useQuery(EVENTS_QUERY);

  // TODO - perhaps a redirect to organization pages instead
  if (!currentOrg) {
    return <LandingPage />;
  }

  const showTodos = currentOrgMember?.isOrgAdmin && !currentOrg.finishedTodos;

  return (
    <>
      <SubMenu currentOrgMember={currentOrgMember} />
      <PageHero>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-2">
            <EditableField
              value={currentOrg.info}
              label="Add message"
              placeholder={`# Welcome to ${currentOrg.name}'s page`}
              canEdit={currentOrgMember?.isOrgAdmin}
              name="info"
              className="h-10"
              MUTATION={gql`
                mutation EditOrgInfo($organizationId: ID!, $info: String) {
                  editOrganization(
                    organizationId: $organizationId
                    info: $info
                  ) {
                    id
                    info
                  }
                }
              `}
              variables={{ organizationId: currentOrg.id }}
              maxLength={500}
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-right">
              {events.length} {dreamName(currentOrg)}{" "}
              {events.length === 1 ? "collection" : "collections"}
            </h2>
            {currentOrgMember?.isOrgAdmin && (
              <Link href={`/new-collection`}>
                <Button size="large" color="anthracit" className="float-right">
                  New collection
                </Button>
              </Link>
            )}
          </div>
        </div>
      </PageHero>
      <div
        className={`-mt-12 page flex-1 grid gap-10 grid-cols-1 ${
          showTodos ? "md:grid-cols-5" : ""
        }`}
      >
        <div
          className={`grid gap-4 ${
            showTodos
              ? "grid-cols-1 md:grid-cols-2 col-span-3"
              : "grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {events.map((event) => (
            <Link
              href="/[event]"
              as={`/${event.slug}`}
              key={event.slug}
              passHref
            >
              <LinkCard color={event.color}>
                {event.title}
                {event.archived && (
                  <Label className="right-0 m-2">Archived</Label>
                )}
              </LinkCard>
            </Link>
          ))}
          {currentOrgMember?.isOrgAdmin && (
            <Link href="/new-collection">
              <button
                type="button"
                className="self-center flex items-center justify-center h-32 w-32 border-dashed border-3 rounded bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-500 transition-colors ease-in-out duration-200 pointer-cursor z-10 relative focus:outline-none focus:border-green"
              >
                <AddIcon className="p-8" />
              </button>
            </Link>
          )}
        </div>
        {showTodos && (
          <div className="col-span-2">
            {/* <div className="text-sm font-semibold mb-10 block">Get Going</div> */}
            <TodoList subdomain={currentOrg.subdomain} />
          </div>
        )}
      </div>
    </>
  );
};

export default IndexPage;
