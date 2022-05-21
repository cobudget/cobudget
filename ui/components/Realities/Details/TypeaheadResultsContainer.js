import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useQuery } from "@apollo/client";
import { Card, CardBody } from "reactstrap";
import HappySpinner from "components/HappySpinner";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";
import withDebouncedProp from "./withDebouncedProp";
import TypeaheadResults from "./TypeaheadResults";
import { FormattedMessage } from "react-intl";

const Wrapper = styled(Card)`
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
  left: 0;
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: 10;
`;

const TypeaheadResultsContainer = withDebouncedProp(
  "inputValue",
  250
)(
  ({
    inputValue,
    getMenuProps,
    getItemProps,
    highlightedIndex,
    itemToResult,
    searchQuery,
    queryDataToResultsArray,
  }) => {
    const realitiesApollo = getRealitiesApollo();
    const { loading, error, data } = useQuery(searchQuery, {
      client: realitiesApollo,
      variables: { term: inputValue },
      fetchPolicy: "no-cache",
    });

    if (!inputValue) return null;
    return (
      <Wrapper>
        {(() => {
          if (loading) return <HappySpinner />;
          if (error) return <CardBody>`Error! ${error.message}`</CardBody>;
          const searchResults = queryDataToResultsArray(data) || [];
          if (searchResults.length === 0)
            return <CardBody><FormattedMessage defaultMessage="No results" /></CardBody>;
          return (
            <TypeaheadResults
              results={searchResults}
              getMenuProps={getMenuProps}
              getItemProps={getItemProps}
              highlightedIndex={highlightedIndex}
              itemToResult={itemToResult}
            />
          );
        })()}
      </Wrapper>
    );
  }
);

TypeaheadResultsContainer.propTypes = {
  inputValue: PropTypes.string,
  getMenuProps: PropTypes.func,
  getItemProps: PropTypes.func,
  highlightedIndex: PropTypes.number,
  itemToResult: PropTypes.func,
  searchQuery: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  queryDataToResultsArray: PropTypes.func,
};

TypeaheadResultsContainer.defaultProps = {
  inputValue: "",
  getMenuProps: () => {
    return;
  },
  getItemProps: () => {
    return;
  },
  highlightedIndex: null,
  itemToResult: () => "",
  searchQuery: {},
  queryDataToResultsArray: () => [],
};

export default TypeaheadResultsContainer;
