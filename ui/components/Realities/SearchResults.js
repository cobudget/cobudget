import React from "react";
import PropTypes from "prop-types";
import { List, ListItem } from "@material-ui/core";
import TypeBadge from "./Details/TypeBadge";

const SearchResults = ({
  results,
  getMenuProps,
  getItemProps,
  highlightedIndex,
}) => (
  // todo: it'd be better to have the menuProps on the ListGroup (i think we might
  // be breaking the accessibility thing now), but that's apparently a
  // functional component so when it tries to attach a ref to it it breaks
  <div {...getMenuProps()}>
    <List>
      {results.map((item, index) => (
        // eslint-disable-next-line react/jsx-key
        <ListItem
          {...getItemProps({
            key: item.nodeId,
            item,
            style: {
              backgroundColor: highlightedIndex === index ? "#f8f9fa" : "white",
            },
          })}
        >
          <TypeBadge nodeType={item.__typename} />
          {item.title || item.name}
        </ListItem>
      ))}
    </List>
  </div>
);

SearchResults.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
      fulfills: PropTypes.shape({
        nodeId: PropTypes.string,
      }),
    })
  ),
  getMenuProps: PropTypes.func,
  getItemProps: PropTypes.func,
  highlightedIndex: PropTypes.number,
};

SearchResults.defaultProps = {
  results: [],
  getMenuProps: () => {},
  getItemProps: () => {},
  highlightedIndex: null,
};

export default SearchResults;
