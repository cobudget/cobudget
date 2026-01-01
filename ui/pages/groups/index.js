import { useQuery, useMutation, gql } from "urql";
import GroupsTable from "../../components/Group/GroupsTable";
import Spinner from "../../components/Spinner";
import Router from "next/router";

export const GROUPS_QUERY = gql`
  query Groups {
    groups {
      id
      name
      logo
      slug
    }
  }
`;

const DELETE_GROUP = gql`
  mutation DeleteGroup($groupId: ID!) {
    deleteGroup(groupId: $groupId) {
      id
    }
  }
`;

export default () => {
  const [
    { data: { groups } = { groups: [] }, fetching: loading, error },
  ] = useQuery({ query: GROUPS_QUERY });

  const [, deleteGroup] = useMutation(
    DELETE_GROUP
    // update(cache, { data: { deleteGroup } }) {
    //   const { groups } = cache.readQuery({
    //     query: GROUPS_QUERY,
    //   });

    //   cache.writeQuery({
    //     query: GROUPS_QUERY,
    //     data: {
    //       groups: groups.filter(
    //         (group) => group.id !== deleteGroup.id
    //       ),
    //     },
    //   });
    // },
  );

  const updateGroup = async ({ groupId }) => {
    Router.push("/groups/[group]/edit", `/groups/${groupId}/edit`);
  };

  if (error) {
    return (
      <h1 className="flex-grow flex justify-center items-center text-3xl text-red">
        {error.message}
      </h1>
    );
  }

  if (loading)
    return (
      <div className="flex-grow flex justify-center items-center">
        <Spinner size="lg" className="text-gray-400" />
      </div>
    );

  return (
    <>
      <div className="max-w-screen-md flex-1">
        <h2 className="flex justify-between text-xl mb-3">
          {groups.length} groups
        </h2>
        <GroupsTable
          groups={groups}
          deleteGroup={deleteGroup}
          updateGroup={updateGroup}
        />
      </div>
    </>
  );
};
