import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import HappySpinner from "../../components/HappySpinner";
import OrganizationsTable from "../../components/organizations/OrganizationsTable";

export const ORGANIZATIONS_QUERY = gql`
  query Organizations {
    organizations {
      id
      name
      subdomain
      customDomain
    }
  }
`;

const DELETE_ORGANIZATION = gql`
  mutation DeleteOrganization($organizationId: ID!) {
    deleteOrganization(organizationId: $organizationId) {
      id
    }
  }
`;

export default ({ }) => {
  const {
    data: { organizations } = { organizations: [] },
    loading,
    error,
  } = useQuery(ORGANIZATIONS_QUERY, { });

  const [deleteOrganization] = useMutation(DELETE_ORGANIZATION, {
    update(cache, { data: { deleteOrganization } }) {
      const { organizations } = cache.readQuery({
        query: ORGANIZATIONS_QUERY,
      });
      console.log({deleteOrganization});

      cache.writeQuery({
        query: ORGANIZATIONS_QUERY,
        data: {
          organizations: organizations.filter((organization) => organization.id !== deleteOrganization.id),
        },
      });
    },
  });

  if(error) {
    return (
      <h1 className="flex-grow flex justify-center items-center text-3xl text-red">
        {error.message}
      </h1>
    );
  }

  if (loading)
    return (
      <div className="flex-grow flex justify-center items-center">
        <HappySpinner />
      </div>
    );

  return (
    <>
      <div className="max-w-screen-md flex-1">
        <h2 className="flex justify-between text-xl mb-3">{organizations.length} organizations</h2>
        <OrganizationsTable
          organizations={organizations}
          deleteOrganization={deleteOrganization}
        />
      </div>
    </>
  );
};
