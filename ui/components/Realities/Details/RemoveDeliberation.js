import React from "react";
import PropTypes from "prop-types";
import { gql, useMutation } from "@apollo/client";
//import { withRouter } from "react-router-dom";
import { Button } from "reactstrap";

const REMOVE_RESP_HAS_DELIBERATION = gql`
  mutation RemoveDeliberation_removeRespHasDeliberationMutation(
    $from: _ResponsibilityInput!
    $to: _InfoInput!
  ) {
    removeRespHasDeliberation(from: $from, to: $to) {
      from {
        nodeId
        deliberations {
          nodeId
        }
      }
    }
  }
`;

const RemoveDeliberation = ({ url }) => {
  // TODO
  const params = { responsibilityId: null };
  const [removeDeliberation, { loading }] = useMutation(
    REMOVE_RESP_HAS_DELIBERATION
  );

  return (
    <Button
      size="sm"
      color="danger"
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation();
        removeDeliberation({
          variables: {
            from: { nodeId: params.responsibilityId },
            to: { url },
          },
        });
      }}
    >
      Remove
    </Button>
  );
};

RemoveDeliberation.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      responsibilityId: PropTypes.string,
    }),
  }),
};

RemoveDeliberation.defaultProps = {
  match: {
    params: {
      responsibilityId: undefined,
    },
  },
};

export default RemoveDeliberation;
