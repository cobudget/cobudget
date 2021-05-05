import React from "react";
import PropTypes from "prop-types";
import { useQuery } from "@apollo/client";
//import { useParams } from "react-router-dom";
import { GET_RESPONSIBILITIES, CACHE_QUERY } from "lib/realities/queries";
import {
  REALITIES_CREATE_SUBSCRIPTION,
  REALITIES_DELETE_SUBSCRIPTION,
  REALITIES_UPDATE_SUBSCRIPTION,
} from "lib/realities/subscriptions";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";
import HappySpinner from "components/HappySpinner";
import CreateResponsibility from "./CreateResponsibility";
import ResponsibilitiesList from "./ResponsibilitiesList";

const ResponsibilitiesContainer = ({ needId }) => {
  const realitiesApollo = getRealitiesApollo();
  //const params = useParams();
  const params = { responsibilityId: null };
  const { data: localData = {} } = useQuery(CACHE_QUERY, {
    client: realitiesApollo,
  });
  const { subscribeToMore, loading, error, data = {} } = useQuery(
    GET_RESPONSIBILITIES,
    {
      client: realitiesApollo,
      variables: { needId },
      fetchPolicy: "cache-and-network",
    }
  );

  return (
    <div>
      {localData.showCreateResponsibility && (
        <CreateResponsibility needId={needId} />
      )}
      {(() => {
        if (loading && !data.responsibilities) return <HappySpinner />;
        if (error) return `Error! ${error.message}`;
        if (!data.responsibilities) return null;
        return (
          <ResponsibilitiesList
            responsibilities={data.responsibilities}
            selectedResponsibilityId={params.responsibilityId}
            subscribeToResponsibilitiesEvents={() => {
              const unsubscribes = [
                subscribeToMore({
                  document: REALITIES_CREATE_SUBSCRIPTION,
                  updateQuery: (prev, { subscriptionData, variables }) => {
                    if (!subscriptionData.data) return prev;

                    const { realityCreated } = subscriptionData.data;

                    // do nothing if the reality is not a responsibility or
                    // if it does not belong to this need
                    if (
                      realityCreated.__typename !== "Responsibility" ||
                      realityCreated.fulfills.nodeId !== variables.needId
                    ) {
                      return prev;
                    }

                    // item will already exist in cache if it was added by the current client
                    const alreadyExists =
                      prev.responsibilities.filter(
                        (resp) => resp.nodeId === realityCreated.nodeId
                      ).length > 0;

                    if (alreadyExists) return prev;
                    return {
                      responsibilities: [
                        realityCreated,
                        ...prev.responsibilities,
                      ],
                    };
                  },
                }),
                subscribeToMore({
                  document: REALITIES_DELETE_SUBSCRIPTION,
                  updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;

                    const { realityDeleted } = subscriptionData.data;

                    return {
                      responsibilities: prev.responsibilities.filter(
                        (item) => item.nodeId !== realityDeleted.nodeId
                      ),
                    };
                  },
                }),
                subscribeToMore({
                  document: REALITIES_UPDATE_SUBSCRIPTION,
                  updateQuery: (prev, { subscriptionData }) => {
                    if (!subscriptionData.data) return prev;

                    const { realityUpdated } = subscriptionData.data;

                    return {
                      responsibilities: prev.responsibilities.map((item) => {
                        if (item.nodeId === realityUpdated.nodeId)
                          return realityUpdated;
                        return item;
                      }),
                    };
                  },
                }),
              ];

              return () => unsubscribes.forEach((fn) => fn());
            }}
          />
        );
      })()}
    </div>
  );
};

ResponsibilitiesContainer.propTypes = {
  needId: PropTypes.string.isRequired,
};

export default ResponsibilitiesContainer;
