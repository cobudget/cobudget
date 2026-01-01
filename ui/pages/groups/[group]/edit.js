import { useRouter } from "next/router";
import { useQuery, gql } from "urql";
import Spinner from "components/Spinner";
import EditGroup from "components/Group/EditGroup";

export const GROUP_QUERY = gql`
  query Group($id: ID!) {
    group(id: $id) {
      id
      name
      logo
      slug
    }
  }
`;

export default () => {
  const router = useRouter();
  const [
    { data: { group } = { group: null }, fetching: loading, error },
  ] = useQuery({ query: GROUP_QUERY, variables: { id: router.query.group } });

  if (error) {
    return (
      <h1 className="flex-grow flex justify-center items-center text-3xl text-red">
        {error?.networkError?.result?.errors?.length > 0
          ? error?.networkError?.result?.errors[0].message
          : error.message}
      </h1>
    );
  }

  return (
    <>
      {loading ? (
        <div className="flex-grow flex justify-center items-center h-64">
          <Spinner size="lg" className="text-gray-400" />
        </div>
      ) : (
        <EditGroup group={group} />
      )}
    </>
  );
};
