import PropTypes from "prop-types";
import { gql, useQuery } from "@apollo/client";
import styled from "styled-components";
import _ from "lodash";
import { Card, CardBody } from "reactstrap";
import HappySpinner from "components/HappySpinner";
import getRealitiesApollo from "lib/realities/getRealitiesApollo";
import withDebouncedProp from "./Details/withDebouncedProp";
import SearchResults from "./SearchResults";

const GET_SEARCH = gql`
  query Search_searchNeedsAndResponsibilities($term: String!) {
    needs(search: $term) {
      nodeId
      title
    }
    responsibilities(search: $term) {
      nodeId
      title
      fulfills {
        nodeId
      }
    }
    persons(search: $term) {
      nodeId
      email
      name
    }
  }
`;

const Wrapper = styled(Card)`
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
  left: 0;
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: 10;
`;

const SearchResultsContainer = withDebouncedProp(
  "searchTerm",
  250
)(({ searchTerm, getMenuProps, getItemProps, highlightedIndex }) => {
  if (!searchTerm) return null;

  const realitiesApollo = getRealitiesApollo();

  const { loading, error, data } = useQuery(GET_SEARCH, {
    client: realitiesApollo,
    variables: { term: searchTerm },
    fetchPolicy: "no-cache",
  });

  return (
    <Wrapper>
      {(() => {
        if (loading) return <HappySpinner />;
        if (error) return <CardBody>`Error! ${error.message}`</CardBody>;
        const searchResults = [
          ...(data.needs || []),
          ...(data.responsibilities || []),
          // TODO: add person page
          //...(data.persons || []),
        ];
        if (searchResults.length === 0) return <CardBody>No results</CardBody>;
        return (
          <SearchResults
            results={_.orderBy(
              searchResults,
              [
                (r) => {
                  if (r.title) return r.title.toLowerCase();
                  else if (r.name) return r.name.toLowerCase();
                  return "";
                },
              ],
              ["asc"]
            )}
            getMenuProps={getMenuProps}
            getItemProps={getItemProps}
            highlightedIndex={highlightedIndex}
          />
        );
      })()}
    </Wrapper>
  );
});

SearchResultsContainer.propTypes = {
  searchTerm: PropTypes.string,
  getMenuProps: PropTypes.func,
  getItemProps: PropTypes.func,
  highlightedIndex: PropTypes.number,
};

SearchResultsContainer.defaultProps = {
  searchTerm: "",
  getMenuProps: () => {},
  getItemProps: () => {},
  highlightedIndex: null,
};

export default SearchResultsContainer;
