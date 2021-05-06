import React from "react";
import PropTypes from "prop-types";
//import { useHistory, useParams } from "react-router-dom";
import AddDependency from "./AddDependency";
import DependencyList from "./DependencyList";

const Dependencies = ({ isLoggedIn, nodeId, dependencies, showAddRemove }) => {
  //const history = useHistory();
  //const { orgSlug } = useParams();
  return (
    <div>
      {isLoggedIn && showAddRemove && <AddDependency nodeId={nodeId} />}
      <DependencyList
        dependencies={dependencies.map((dep) => ({
          node: dep,
          onClick: () => null /*history.push(`/${orgSlug}/${dep.nodeId}`)*/,
        }))}
        showRemove={isLoggedIn && showAddRemove}
      />
    </div>
  );
};

Dependencies.propTypes = {
  auth: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
  }),
  nodeId: PropTypes.string,
  dependencies: PropTypes.arrayOf(
    PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
      fulfills: PropTypes.shape({
        nodeId: PropTypes.string,
      }),
    })
  ),
  showAddRemove: PropTypes.bool,
};

Dependencies.defaultProps = {
  auth: {
    isLoggedIn: false,
  },
  nodeId: "",
  dependencies: [],
  showAddRemove: false,
};

export default Dependencies;
