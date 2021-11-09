import { forwardRef } from "react";
import { useQuery, gql } from "urql";
import Link from "next/link";
import Button from "../../components/Button";
import TodoList from "../../components/TodoList";
import { AddIcon } from "../../components/Icons";
import Label from "../../components/Label";
import SubMenu from "../../components/SubMenu";
import PageHero from "../../components/PageHero";
import EditableField from "components/EditableField";

const EVENTS_QUERY = gql`
  query Events($orgSlug: String!) {
    events(orgSlug: $orgSlug) {
      id
      slug
      title
      archived
      color
    }
  }
`;

const LinkCard = forwardRef((props: any, ref) => {
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

const IndexPage = ({ router, currentOrg, currentOrgMember }) => {
  const [{ data }] = useQuery({
    query: EVENTS_QUERY,
    variables: { orgSlug: router.query.org },
  });

  const events = data?.events ?? [];
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
              required
            />
          </div>
          <div>
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
        </div>
        {showTodos && (
          <div className="col-span-2">
            <TodoList currentOrg={currentOrg} />
          </div>
        )}
      </div>
    </>
  );
};

export default IndexPage;
