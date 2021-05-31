import React from "react";
import PropTypes from "prop-types";
import { Button, Card } from "@material-ui/core";
import { useQuery } from "@apollo/client";
import styled from "styled-components";
import { FaPlus } from "react-icons/fa";
import { CACHE_QUERY } from "lib/realities/queries";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";

const ListHeaderText = styled.span`
  line-height: 2.1rem;
`;

const ListHeader = ({ needIsExpanded }) => {
  const realitiesApollo = getRealitiesApollo();
  const { data: localData = {}, client } = useQuery(CACHE_QUERY, {
    client: realitiesApollo,
  });

  return (
    <Card>
      <div className="m-2 space-x-2">
        <Button
          onClick={() =>
            client.writeQuery({
              query: CACHE_QUERY,
              data: {
                showCreateNeed: !localData.showCreateNeed,
                showCreateResponsibility: false,
              },
            })
          }
          data-cy="list-header-create-need-btn"
        >
          <ListHeaderText>Need</ListHeaderText>
          <FaPlus />
        </Button>
        <Button
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
          data-cy="list-header-create-resp-btn"
        >
          <ListHeaderText>Responsibility</ListHeaderText>
          <FaPlus />
        </Button>
      </div>
    </Card>
  );
};

ListHeader.propTypes = {
  needIsExpanded: PropTypes.bool,
};

ListHeader.defaultProps = {
  needIsExpanded: false,
};

export default ListHeader;
