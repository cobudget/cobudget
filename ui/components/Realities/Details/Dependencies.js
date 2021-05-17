import React from "react";
import PropTypes from "prop-types";
import AddDependency from "./AddDependency";
import DependencyList from "./DependencyList";

const Dependencies = ({ isLoggedIn, nodeId, dependencies, showAddRemove }) => {
  return (
    <div className="mt-5">
      {isLoggedIn && showAddRemove && <AddDependency nodeId={nodeId} />}
      <DependencyList
        dependencies={dependencies}
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
