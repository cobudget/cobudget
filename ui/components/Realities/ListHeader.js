import React from "react";
import PropTypes from "prop-types";
import { Button, Card } from "reactstrap";
import { useQuery } from "@apollo/client";
import styled from "styled-components";
import { FaPlus } from "react-icons/fa";
import { CACHE_QUERY } from "lib/realities/queries";

const StyledHeader = styled(Card)`
  color: white;
  flex-direction: row;
  font-size: 1.25rem;
  justify-content: start;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
`;

const AddButton = styled(Button)`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  grid-column-gap: 0.3rem;
  margin-right: 0.5rem;
`;

const ListHeaderText = styled.span`
  line-height: 2.1rem;
`;

const ListHeader = ({ needIsExpanded }) => {
  const { data: localData = {}, client } = useQuery(CACHE_QUERY);

  return (
    <StyledHeader>
      <AddButton
        onClick={() =>
          client.writeQuery({
            query: CACHE_QUERY,
            data: {
              showCreateNeed: !localData.showCreateNeed,
              showCreateResponsibility: false,
            },
          })
        }
        color="need"
        data-cy="list-header-create-need-btn"
      >
        <ListHeaderText>Need</ListHeaderText>
        <FaPlus />
      </AddButton>
      <AddButton
        style={{
          visibility: needIsExpanded ? "" : "hidden",
        }}
        onClick={() =>
          client.writeQuery({
            query: CACHE_QUERY,
            data: {
              showCreateResponsibility: !localData.showCreateResponsibility,
              showCreateNeed: false,
            },
          })
        }
        color="responsibility"
        data-cy="list-header-create-resp-btn"
      >
        <ListHeaderText>Responsibility</ListHeaderText>
        <FaPlus />
      </AddButton>
    </StyledHeader>
  );
};

ListHeader.propTypes = {
  needIsExpanded: PropTypes.bool,
};

ListHeader.defaultProps = {
  needIsExpanded: false,
};

export default ListHeader;
