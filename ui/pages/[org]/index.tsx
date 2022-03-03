import { forwardRef, useEffect } from "react";
import { useQuery, gql } from "urql";
import Link from "next/link";
import Button from "../../components/Button";
import TodoList from "../../components/TodoList";
import Label from "../../components/Label";
import SubMenu from "../../components/SubMenu";
import PageHero from "../../components/PageHero";
import EditableField from "components/EditableField";
import Router from "next/router";
export const ROUNDS_QUERY = gql`
  query Rounds($orgId: ID!) {
    rounds(orgId: $orgId) {
      id
      slug
      title
      archived
      color
      organization {
        id
        slug
      }
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

const IndexPage = ({ router, currentOrg, currentUser }) => {
  useEffect(() => {
    if (router.query.org == "c") router.replace("/");
  }, []);

  const [{ data, error }] = useQuery({
    query: ROUNDS_QUERY,
    variables: { orgId: currentOrg?.id },
  });
  if (!currentOrg) return null;

  const rounds = data?.rounds ?? [];
  const showTodos =
    currentUser?.currentOrgMember?.isAdmin && !currentOrg.finishedTodos;

  return (
    <>
      <SubMenu currentUser={currentUser} />
      <PageHero>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-2">
            <EditableField
              defaultValue={currentOrg?.info}
              name="info"
              label="Add message"
              placeholder={`# Welcome to ${currentOrg?.name}'s page`}
              canEdit={currentUser?.currentOrgMember?.isAdmin}
              className="h-10"
              MUTATION={gql`
                mutation EditOrgInfo($orgId: ID!, $info: String) {
                  editOrganization(orgId: $orgId, info: $info) {
                    id
                    info
                  }
                }
              `}
              variables={{ orgId: currentOrg?.id }}
              maxLength={500}
              required
            />
          </div>
          <div>
            {currentUser?.currentOrgMember?.isAdmin && (
              <Link href={`/${currentOrg.slug}/new-round`}>
                <Button size="large" color="anthracit" className="float-right">
                  New round
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
          className={`grid gap-4 content-start ${
            showTodos
              ? "grid-cols-1 md:grid-cols-2 col-span-3"
              : "grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {rounds.map((round) => (
            <Link
              href={`/${round.organization.slug}/${round.slug}`}
              key={round.slug}
              passHref
            >
              <LinkCard color={round.color}>
                {round.title}
                {round.archived && (
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
