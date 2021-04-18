import React from "react";
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

const RealitiesPage = () => {
  const { data, error, loading } = useQuery(GET_NEEDS, {
    skip: typeof window === "undefined",
    client: realitiesApollo,
  });

  if (error) {
    console.error("realities error", error);
    return "error";
  }
  if (loading) return <HappySpinner />;

  return (
    <div>
      <div>Needs & Resps:</div>
      <ul className="list-disc">
        {data?.needs.map((need) => {
          return (
            <React.Fragment key={need.nodeId}>
              <li>{need.title}</li>
              {need.fulfilledBy.map((resp) => {
                return (
                  <li key={resp.nodeId} className="ml-5">
                    {resp.title}
                  </li>
                );
              })}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default RealitiesPage;
