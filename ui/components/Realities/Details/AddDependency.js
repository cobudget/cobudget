import React from "react";
import PropTypes from "prop-types";
import { gql, useMutation } from "@apollo/client";
import { FormGroup, Label } from "reactstrap";
import TypeaheadInput from "./TypeaheadInput";
import TypeBadge from "./TypeBadge";

const ADD_DEPENDENCY = gql`
  mutation AddDependency_addResponsibilityDependsOnResponsibilitiesMutation(
    $from: _ResponsibilityInput!
    $to: _ResponsibilityInput!
  ) {
    addResponsibilityDependsOnResponsibilities(from: $from, to: $to) {
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

const AddDependency = ({ nodeType, nodeId }) => {
  const [addDependency, { loading: loadingAddDependency }] = useMutation(
    ADD_DEPENDENCY
  );

  return (
    <FormGroup>
      <Label for="editDetailsTitle">Add dependency</Label>
      <TypeaheadInput
        placeholder="Search responsibilities"
        disabled={loadingAddDependency}
        searchQuery={gql`
          query AddDependency_searchResponsibilities($term: String!) {
            responsibilities(search: $term) {
              nodeId
              title
            }
          }
        `}
        queryDataToResultsArray={(data) => data.responsibilities || []}
        itemToString={(i) => (i && i.title) || ""}
        itemToResult={(i) => (
          <span>
            <TypeBadge nodeType={i.__typename} />
            {i.title}
          </span>
        )}
        onChange={(node, { reset, clearSelection }) => {
          clearSelection();
          reset();
          addDependency({
            variables: {
              from: { nodeId },
              to: { nodeId: node.nodeId },
            },
          });
        }}
      />
    </FormGroup>
  );
};

AddDependency.propTypes = {
  nodeType: PropTypes.string,
  nodeId: PropTypes.string,
};

AddDependency.defaultProps = {
  nodeType: "Need",
  nodeId: "",
};

export default AddDependency;
