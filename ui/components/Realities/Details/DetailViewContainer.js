import React from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { gql, useQuery } from "@apollo/client";
import HappySpinner from "components/HappySpinner";
import { GET_RESP_FULFILLS, CACHE_QUERY } from "lib/realities/queries";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";
import DetailView from "./DetailView";

const createDetailViewQuery = (nodeType) => {
  const isResp = nodeType === "responsibility";
  return gql`
  query DetailViewContainer_${nodeType}($nodeId: ID!) {
    ${nodeType}(nodeId: $nodeId) {
      nodeId
      title
      description
      guide {
        nodeId
        email
        name
      }
      ${
        isResp
          ? `realizer {
          nodeId
          email
          name
        }
        deliberations {
          nodeId
          title
          url
        }
        dependsOnResponsibilities {
          nodeId
          title
          fulfills {
            nodeId
          }
        }
        responsibilitiesThatDependOnThis {
          nodeId
          title
          fulfills {
            nodeId
          }
        }
      `
          : ""
      }
      ${isResp ? "fulfills" : "fulfilledBy"} {
        nodeId
        title
      }
    }
    showDetailedEditNeedView @client
    showDetailedEditRespView @client
  }
`;
};

const GET_NEED = createDetailViewQuery("need");
const GET_RESPONSIBILITY = createDetailViewQuery("responsibility");

const DetailViewContainer = ({ currentUser, fullscreen, viewResp }) => {
  const router = useRouter();
  const { query } = router;
  const realitiesApollo = getRealitiesApollo();

  // sorry for the confusing code, i blame not being able to use control flow
  // around hooks

  /* there are 5 cases to handle
    * we're on an /orgSlug/respId url. we want to render need and resp at
    the same time
      1. we're rendering a need. get the needId from checking the resp's
      fulfills field
      2. we're rendering a resp. get the respId from the url
    * we're on an /orgSlug/need/needId url. we just want to render the need
      3. we're rendering the need. get the needId from the url
      4. we're "rendering" a resp. return null
    * we're just on /orgslug
      5. don't render anything
  */

  const {
    loading: loadingFulfills,
    error: errorFulfills,
    data: dataFulfills,
  } = useQuery(GET_RESP_FULFILLS, {
    client: realitiesApollo,
    variables: { responsibilityId: query.respId },
    skip: !query.respId || viewResp,
  });

  let needId;
  if (query.respId) {
    needId =
      !loadingFulfills && dataFulfills && dataFulfills.responsibility
        ? dataFulfills.responsibility.fulfills.nodeId
        : "";
  } else if (query.needId) {
    needId = query.needId;
  }

  const queryProps = viewResp
    ? {
        query: GET_RESPONSIBILITY,
        variables: {
          nodeId: query.respId,
        },
        skip: !query.respId,
      }
    : {
        query: GET_NEED,
        variables: {
          nodeId: needId,
        },
        skip: !needId,
      };
  const { loading, error, data = {}, client } = useQuery(queryProps.query, {
    ...queryProps,
    client: realitiesApollo,
  });

  if (!query.respId && !needId) return null;
  if (loadingFulfills || loading) return <HappySpinner />;
  if (error) return `Error! ${error.message}`;
  if (errorFulfills) return `Error! ${errorFulfills.message}`;

  //const fullscreenToggleUrl = fullscreen
  //  ? `/${params.orgSlug}/${params.responsibilityId || `need/${needId}`}`
  //  : `/${params.orgSlug}/reality/${
  //      params.responsibilityId || `need/${needId}`
  //    }`;
  const onClickFullscreen = () => null; /*history.push(fullscreenToggleUrl)*/

  const showEdit = viewResp
    ? data.showDetailedEditRespView
    : data.showDetailedEditNeedView;

  const setEdit = (val) =>
    client.writeQuery({
      query: CACHE_QUERY,
      data: {
        showDetailedEditNeedView: !viewResp ? val : undefined,
        showDetailedEditRespView: viewResp ? val : undefined,
      },
    });

  const node = viewResp ? data.responsibility : data.need;
  if (!node) return null;
  return (
    <DetailView
      node={node}
      fullscreen={fullscreen}
      showEdit={showEdit}
      isLoggedIn={!!currentUser}
      startEdit={() => setEdit(true)}
      stopEdit={() => setEdit(false)}
      onClickFullscreen={onClickFullscreen}
    />
  );
};

DetailViewContainer.propTypes = {
  fullscreen: PropTypes.bool,
  viewResp: PropTypes.bool.isRequired,
};

DetailViewContainer.defaultProps = {
  fullscreen: false,
};

export default DetailViewContainer;
