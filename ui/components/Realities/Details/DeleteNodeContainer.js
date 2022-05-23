import React, { useState } from "react";
import PropTypes from "prop-types";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { GET_NEEDS, GET_RESPONSIBILITIES } from "lib/realities/queries";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";
import DeleteNodeButton from "./DeleteNodeButton";
import { FormattedMessage, useIntl } from "react-intl";

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
  const router = useRouter();
  const intl = useIntl();
  const { __typename: nodeType, nodeId } = node;
  const realitiesApollo = getRealitiesApollo();
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [softDeleteNode, { loading, error }] = useMutation(
    nodeType === "Need" ? SOFT_DELETE_NEED : SOFT_DELETE_RESPONSIBILITY,
    {
      client: realitiesApollo,
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
          router.push(`/realities`);
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
          router.push(`/realities/need/${needId}`);
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
          ? intl.formatMessage({
              defaultMessage:
                "You can't delete a Need that still contains Responsibilities",
            })
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
