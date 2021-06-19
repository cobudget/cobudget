import React from "react";
import PropTypes from "prop-types";
import { List, ListItem, ListItemSecondaryAction } from "@material-ui/core";
import { useRouter } from "next/router";
import TypeBadge from "./TypeBadge";
import RemoveDependency from "./RemoveDependency";

const Dependencies = ({ dependencies, showRemove }) => {
  const router = useRouter();

  return (
    <List>
      {dependencies.map(({ __typename, nodeId, title }) => (
        <ListItem
          key={nodeId}
          button
          onClick={() => router.push(`/realities/${nodeId}`)}
        >
          <TypeBadge nodeType={__typename} />
          {title}
          {showRemove && (
            <ListItemSecondaryAction>
              <RemoveDependency nodeId={nodeId} />
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
};

Dependencies.propTypes = {
  dependencies: PropTypes.arrayOf(
    PropTypes.shape({
      __typename: PropTypes.string,
      nodeId: PropTypes.string,
      title: PropTypes.string,
    })
  ),
  showRemove: PropTypes.bool,
};

Dependencies.defaultProps = {
  dependencies: [],
  showRemove: false,
};

export default Dependencies;
