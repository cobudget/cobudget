import { useQuery, gql } from "@apollo/client";
import HappySpinner from "components/HappySpinner";
import createRealitiesApollo from "lib/realities/createRealitiesApollo";

export const GET_NEEDS = gql`
  query Needs {
    needs {
      nodeId
      title
      fulfilledBy {
        nodeId
        title
        realizer {
          nodeId
          name
        }
      }
    }
  }
`;
const realitiesApollo = createRealitiesApollo();

const RealitiesPage = ({ currentOrg, currentOrgMember }) => {
  console.log("on realities page", { currentOrg, currentOrgMember });

  const { data, error, loading } = useQuery(GET_NEEDS, {
    skip: typeof window === "undefined",
    client: realitiesApollo,
  });

  if (error) {
    console.error("realities error", error);
    return "error";
  }
  if (loading) return <HappySpinner />;

  console.log("data", data);

  return (
    <div>
      <div>Needs & Resps:</div>
      <ul className="list-disc">
        {data?.needs.map((need) => {
          return (
            <>
              <li key={need.nodeId}>{need.title}</li>
              {need.fulfilledBy.map((resp) => {
                return (
                  <li key={resp.nodeId} className="ml-5">
                    {resp.title}
                  </li>
                );
              })}
            </>
          );
        })}
      </ul>
    </div>
  );
};

export default RealitiesPage;
