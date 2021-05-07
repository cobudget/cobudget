import React from "react";
import { gql, useMutation } from "@apollo/client";
import { Button } from "reactstrap";
import { useRouter } from "next/router";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";

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
  const router = useRouter();
  const realitiesApollo = getRealitiesApollo();
  const [
    removeDeliberation,
    { loading },
  ] = useMutation(REMOVE_RESP_HAS_DELIBERATION, { client: realitiesApollo });

  return (
    <Button
      size="sm"
      color="danger"
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation();
        removeDeliberation({
          variables: {
            from: { nodeId: router.query.respId },
            to: { url },
          },
        });
      }}
    >
      Remove
    </Button>
  );
};

export default RemoveDeliberation;
