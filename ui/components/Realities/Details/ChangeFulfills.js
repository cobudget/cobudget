import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import PropTypes from "prop-types";
import styled from "styled-components";
import { ListGroupItem, Button, FormGroup, Label } from "reactstrap";
//import { useHistory, useParams } from "react-router-dom";

import { GET_RESPONSIBILITIES } from "lib/realities/queries";
import TypeaheadInput from "./TypeaheadInput";
import TypeBadge from "./TypeBadge";

const StyledFormGroup = styled(FormGroup)`
  margin-bottom: 2em;
`;

const ButtonWrapper = styled.span`
  position: absolute;
  top: 0.54em;
  right: 0.54em;
`;

const CHANGE_FULFILLS = gql`
  mutation changeFulfills($responsibilityId: ID!, $needId: ID!) {
    changeFulfills(responsibilityId: $responsibilityId, needId: $needId) {
      nodeId
      title
      fulfills {
        nodeId
      }
    }
  }
`;

const ChangeFulfills = ({ node }) => {
  //const history = useHistory();
  //const { orgSlug } = useParams();
  const [editing, setEditing] = useState(false);
  const [changeOwner] = useMutation(CHANGE_FULFILLS, {
    update: (cache, { data: { changeFulfills } }) => {
      const { responsibilities } = cache.readQuery({
        query: GET_RESPONSIBILITIES,
        variables: { needId: node.fulfills.nodeId },
      });

      cache.writeQuery({
        query: GET_RESPONSIBILITIES,
        variables: {
          needId: node.fulfills.nodeId,
        },
        data: {
          responsibilities: responsibilities.filter(
            (i) => i.nodeId !== changeFulfills.nodeId
          ),
        },
      });
    },
  });

  const toggleEdit = () => setEditing(!editing);

  return (
    <StyledFormGroup>
      <Label>Fulfills</Label>
      <div>
        {editing ? (
          <TypeaheadInput
            placeholder="Search needs"
            searchQuery={gql`
              query ChangeOwner_searchNeeds($term: String!) {
                needs(search: $term) {
                  nodeId
                  title
                }
              }
            `}
            autoFocus
            onBlur={toggleEdit}
            selectedItem={node.fulfills}
            queryDataToResultsArray={(data) => [...(data.needs || [])]}
            itemToString={(i) => (i && i.title) || ""}
            itemToResult={(i) => (
              <span>
                <TypeBadge nodeType={i.__typename} />
                {i.title}
              </span>
            )}
            onChange={(selectedNode) => {
              if (selectedNode) {
                changeOwner({
                  variables: {
                    responsibilityId: node.nodeId,
                    needId: selectedNode.nodeId,
                  },
                });
                toggleEdit();
              }
            }}
          />
        ) : (
          <ListGroupItem
            onClick={
              () => null
              //TODO
              //history.push(`/${orgSlug}/need/${node.fulfills.nodeId}`)
            }
            action
          >
            <TypeBadge nodeType="Need" />
            {node.fulfills.title}
            <ButtonWrapper>
              <Button
                size="sm"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEdit();
                }}
              >
                Change
              </Button>
            </ButtonWrapper>
          </ListGroupItem>
        )}
      </div>
    </StyledFormGroup>
  );
};

ChangeFulfills.propTypes = {
  node: PropTypes.shape({
    __typename: PropTypes.string,
    nodeId: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    deliberations: PropTypes.arrayOf(
      PropTypes.shape({
        __typename: PropTypes.string,
        nodeId: PropTypes.string,
        title: PropTypes.string,
      })
    ),
    guide: PropTypes.shape({
      nodeId: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    realizer: PropTypes.shape({
      nodeId: PropTypes.string,
      email: PropTypes.string,
      name: PropTypes.string,
    }),
    fulfills: PropTypes.shape({
      nodeId: PropTypes.string,
      title: PropTypes.string,
    }),
    dependsOnResponsibilities: PropTypes.arrayOf(
      PropTypes.shape({
        __typename: PropTypes.string,
        nodeId: PropTypes.string,
        title: PropTypes.string,
        fulfills: PropTypes.shape({
          nodeId: PropTypes.string,
        }),
      })
    ),
  }),
};

ChangeFulfills.defaultProps = {
  node: {
    nodeId: "",
    title: "",
    description: "",
    deliberations: [],
    guide: {
      nodeId: "",
      email: "",
      name: "",
    },
    realizer: {
      nodeId: "",
      email: "",
      name: "",
    },
    fulfills: {
      nodeId: "",
      title: "",
    },
    dependsOnResponsibilities: [],
  },
};

export default ChangeFulfills;
