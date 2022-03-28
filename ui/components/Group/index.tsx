import { forwardRef, useEffect } from "react";
import { useQuery, gql } from "urql";
import Link from "next/link";
import Router, { useRouter } from "next/router";

import Button from "../Button";
import TodoList from "../TodoList";
import Label from "../Label";
import SubMenu from "../SubMenu";
import PageHero from "../PageHero";
import EditableField from "../EditableField";

export const ROUNDS_QUERY = gql`
  query Rounds($groupSlug: String!) {
    rounds(groupSlug: $groupSlug) {
      id
      slug
      title
      archived
      color
      group {
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

const GroupIndex = ({ currentGroup, currentUser }) => {
  const router = useRouter();
  // useEffect(() => {
  //   console.log("hey, group: ", router.query.group);
  //   if (router.query.group == "c") router.replace("/");
  // }, [router.query]);

  const [{ data, error }] = useQuery({
    query: ROUNDS_QUERY,
    variables: { groupSlug: router.query.group ?? "c" },
  });

  console.log({ data, router, currentGroup });

  if (!currentGroup) return null;

  const rounds = data?.rounds ?? [];
  const showTodos =
    currentUser?.currentGroupMember?.isAdmin && !currentGroup.finishedTodos;

  return (
    <>
      <SubMenu currentUser={currentUser} />
      <PageHero>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-2">
            <EditableField
              defaultValue={currentGroup?.info}
              name="info"
              label="Add message"
              placeholder={`# Welcome to ${currentGroup?.name}'s page`}
              canEdit={currentUser?.currentGroupMember?.isAdmin}
              className="h-10"
              MUTATION={gql`
                mutation EditGroupInfo($groupId: ID!, $info: String) {
                  editGroup(groupId: $groupId, info: $info) {
                    id
                    info
                  }
                }
              `}
              variables={{ groupId: currentGroup?.id }}
              maxLength={500}
              required
            />
          </div>
          <div>
            {currentUser?.currentGroupMember?.isAdmin && (
              <Link href={`/${currentGroup.slug}/new-round`}>
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
              href={`/${round.group?.slug ?? "c"}/${round.slug}`}
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
            <TodoList currentGroup={currentGroup} />
          </div>
        )}
      </div>
    </>
  );
};

export default GroupIndex;
