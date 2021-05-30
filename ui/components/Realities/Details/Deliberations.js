import React from "react";
import PropTypes from "prop-types";
//import { withRouter } from "react-router-dom";
import AddDeliberation from "./AddDeliberation";
import DeliberationList from "./DeliberationList";

const Deliberations = ({
  isLoggedIn,
  nodeType,
  nodeId,
  deliberations,
  showAddRemove,
}) => (
  <div>
    {isLoggedIn && showAddRemove && (
      <AddDeliberation nodeType={nodeType} nodeId={nodeId} />
    )}
    <DeliberationList
      deliberations={deliberations.map((info) => ({
        node: info,
      }))}
      showRemove={isLoggedIn && showAddRemove}
    />
  </div>
);

Deliberations.propTypes = {
  auth: PropTypes.shape({
    isLoggedIn: PropTypes.bool,
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
  deliberations: PropTypes.arrayOf(
    PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
    })
  ),
  showAddRemove: PropTypes.bool,
};

Deliberations.defaultProps = {
  auth: {
    isLoggedIn: false,
  },
  history: {
    push: () => null,
  },
  nodeType: "Info",
  nodeId: "",
  deliberations: [],
  showAddRemove: false,
};

export default Deliberations;
