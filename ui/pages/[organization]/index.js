import { forwardRef } from "react";
import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import Button from "components/Button";
import TodoList from "components/TodoList";
import { AddIcon } from "components/Icons";
import Label from "components/Label";
import SubMenu from "components/SubMenu";
import PageHero from "components/PageHero";

const EVENTS_QUERY = gql`
  query Events($slug: String!) {
    events(slug: $slug) {
      id
      slug
      title
      archived
      color
    }
    currentOrgMember(slug: $slug) {
      id
      isOrgAdmin
    }
    currentOrg(slug: $slug) {
      id
      slug
      finishedTodos
    }
  }
`;

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

const IndexPage = ({ router }) => {
  const {
    data: { events, currentOrgMember, currentOrg } = {
      events: [],
      currentOrgMember: null,
      currentOrg: null,
    },
  } = useQuery(EVENTS_QUERY, {
    variables: { slug: router.query.organization },
  });
  //   // TODO - perhaps a redirect to organization pages instead
  //   if (!currentOrg) {
  //     return <LandingPage />;
  //   }

  const showTodos = currentOrgMember?.isOrgAdmin && !currentOrg.finishedTodos;

  return (
    <>
      <SubMenu
        currentOrgMember={currentOrgMember}
        orgSlug={router.query.organization}
      />
      <PageHero>
        <div className="flex justify-between">
          <h2 className="text-2xl font-semibold">
            {events.length} bucket{" "}
            {events.length === 1 ? "collection" : "collections"}
          </h2>
          {currentOrgMember?.isOrgAdmin && (
            <Link href={`/new-collection`}>
              <Button size="large" color="anthracit">
                New collection
              </Button>
            </Link>
          )}
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
              href={`/${currentOrg.slug}/${event.slug}`}
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
