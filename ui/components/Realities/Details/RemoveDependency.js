import React from "react";
import PropTypes from "prop-types";
import { gql, useMutation } from "@apollo/client";
//import { withRouter } from "react-router-dom";
import { Button } from "reactstrap";

const REMOVE_DEPENDENCY = gql`
  mutation RemoveDependency_removeResponsibilityDependsOnResponsibilitiesMutation(
    $from: _ResponsibilityInput!
    $to: _ResponsibilityInput!
  ) {
    removeResponsibilityDependsOnResponsibilities(from: $from, to: $to) {
      from {
        nodeId
        dependsOnResponsibilities {
          nodeId
          title
          fulfills {
            nodeId
          }
        }
      }
    }
  }
`;

const RemoveDependency = ({ nodeId }) => {
  //TODO
  const params = { responsibilityId: null, needId: null };
  const [removeDependency, { loading }] = useMutation(REMOVE_DEPENDENCY);

  return (
    <Button
      size="sm"
      color="danger"
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation();
        removeDependency({
          variables: {
            from: {
              nodeId: params.responsibilityId || params.needId,
            },
            to: { nodeId },
          },
        });
      }}
    >
      Remove
    </Button>
  );
};

RemoveDependency.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      needId: PropTypes.string,
      responsibilityId: PropTypes.string,
    }),
  }),
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
};

RemoveDependency.defaultProps = {
  match: {
    params: {
      needId: undefined,
      responsibilityId: undefined,
    },
  },
  nodeType: "Need",
  nodeId: "",
};

export default RemoveDependency;
