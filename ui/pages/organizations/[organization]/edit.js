import { useRouter } from "next/router";
import { useQuery, gql } from "@apollo/client";
import HappySpinner from "components/HappySpinner";
import EditOrganization from "components/Org/EditOrganization";

export const ORGANIZATION_QUERY = gql`
  query Organization($id: ID!) {
    organization(id: $id) {
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
    data: { organization } = { organization: null },
    loading,
    error,
  } = useQuery(ORGANIZATION_QUERY, {
    variables: { id: router.query.organization },
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
        <EditOrganization organization={organization} />
      )}
    </>
  );
};
