import React, { useState } from "react";
import PropTypes from "prop-types";
import { gql, useMutation } from "@apollo/client";
//import { useHistory, useParams } from "react-router-dom";
import { GET_NEEDS, GET_RESPONSIBILITIES } from "lib/realities/queries";
import DeleteNodeButton from "./DeleteNodeButton";

const SOFT_DELETE_NEED = gql`
  mutation DeleteNodeContainer_softDeleteNeed($nodeId: ID!) {
    softDeleteNeed(nodeId: $nodeId) {
      nodeId
      deleted
    }
  }
`;

const SOFT_DELETE_RESPONSIBILITY = gql`
  mutation DeleteNodeContainer_softDeleteResponsibility($nodeId: ID!) {
    softDeleteResponsibility(nodeId: $nodeId) {
      nodeId
      deleted
      fulfills {
        nodeId
      }
    }
  }
`;

const DeleteNodeContainer = ({ node, stopEdit }) => {
  const { __typename: nodeType, nodeId } = node;
  //const history = useHistory();
  //const params = useParams();
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [softDeleteNode, { loading, error }] = useMutation(
    nodeType === "Need" ? SOFT_DELETE_NEED : SOFT_DELETE_RESPONSIBILITY,
    {
      update: (cache, { data }) => {
        setConfirmationModalIsOpen(false);
        stopEdit();

        if (nodeType === "Need") {
          const { needs } = cache.readQuery({ query: GET_NEEDS });
          cache.writeQuery({
            query: GET_NEEDS,
            data: {
              needs: needs.filter(
                (n) => n.nodeId !== data.softDeleteNeed.nodeId
              ),
            },
          });
          //TODO
          //history.push(`/${params.orgSlug}`);
        } else {
          const needId = data.softDeleteResponsibility.fulfills.nodeId;
          const { responsibilities } = cache.readQuery({
            query: GET_RESPONSIBILITIES,
            variables: { needId },
          });
          cache.writeQuery({
            query: GET_RESPONSIBILITIES,
            variables: { needId },
            data: {
              responsibilities: responsibilities.filter(
                (r) => r.nodeId !== data.softDeleteResponsibility.nodeId
              ),
            },
          });
          //TODO
          //history.push(`/${params.orgSlug}/need/${needId}`);
        }
      },
    }
  );

  const isNeedAndHasResponsibilities =
    nodeType === "Need" && node.fulfilledBy.length > 0;

  return (
    <DeleteNodeButton
      nodeType={nodeType}
      confirmationModalIsOpen={confirmationModalIsOpen}
      onToggleConfirmationModal={() =>
        setConfirmationModalIsOpen(!confirmationModalIsOpen)
      }
      onConfirmSoftDelete={() => softDeleteNode({ variables: { nodeId } })}
      disabled={loading || isNeedAndHasResponsibilities}
      disabledReason={
        isNeedAndHasResponsibilities
          ? "You can't delete a Need that still contains Responsibilities"
          : ""
      }
      error={error && error.toString()}
    />
  );
};

DeleteNodeContainer.propTypes = {
  node: PropTypes.shape({
    __typename: PropTypes.string,
    nodeId: PropTypes.string,
    fulfilledBy: PropTypes.arrayOf(
      PropTypes.shape({
        nodeId: PropTypes.string,
      })
    ),
  }),
  stopEdit: PropTypes.func,
};

DeleteNodeContainer.defaultProps = {
  node: {
    __typename: "need",
    nodeId: "",
    fulfilledBy: [],
  },
  stopEdit: () => null,
};

export default DeleteNodeContainer;
