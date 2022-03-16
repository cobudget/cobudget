import { useRouter } from "next/router";
import { useQuery, gql } from "urql";
import HappySpinner from "components/HappySpinner";
import EditGroup from "components/Group/EditGroup";

export const GROUP_QUERY = gql`
  query Group($id: ID!) {
    group(id: $id) {
      id
      name
      logo
      subdomain
      customDomain
    }
  }
`;

export default () => {
  const router = useRouter();
  const {
    data: { group } = { group: null },
    fetching: loading,
    error,
  } = useQuery(GROUP_QUERY, {
    variables: { id: router.query.group },
  });

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
          <HappySpinner />
        </div>
      ) : (
        <EditGroup group={group} />
      )}
    </>
  );
};
