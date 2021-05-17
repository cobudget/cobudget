import React from "react";
import PropTypes from "prop-types";
import { List, ListItem, ListItemSecondaryAction } from "@material-ui/core";
import TypeBadge from "./TypeBadge";
import RemoveDeliberation from "./RemoveDeliberation";

const DeliberationList = ({ deliberations, showRemove }) => {
  const handleClick = (url) => {
    const win = window.open(url, "_blank");
    win.focus();
  };
  return (
    <List>
      {deliberations.map(({ node: { __typename, nodeId, title, url } }) => (
        <ListItem
          button
          key={nodeId}
          onClick={() => handleClick(url)}
          disableGutters
        >
          <TypeBadge nodeType={__typename} />
          {title || url}
          {showRemove && (
            <ListItemSecondaryAction>
              <RemoveDeliberation url={url} />
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
};

DeliberationList.propTypes = {
  deliberations: PropTypes.arrayOf(
    PropTypes.shape({
      node: PropTypes.shape({
        __typename: PropTypes.string,
        nodeId: PropTypes.string,
        title: PropTypes.string,
      }),
      onClick: PropTypes.func,
    })
  ),
  showRemove: PropTypes.bool,
};

DeliberationList.defaultProps = {
  deliberations: [],
  showRemove: false,
};

export default DeliberationList;
