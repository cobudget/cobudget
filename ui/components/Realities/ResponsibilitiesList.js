import React, { useEffect } from "react";
import PropTypes from "prop-types";
//import styled from "styled-components";
//import { useHistory, useParams } from "react-router-dom";
//import { ListGroup, ListGroupItem } from "reactstrap";
import { List, ListItem } from "@material-ui/core";
import _ from "lodash";
//import colors from "lib/realities/colors";
import RealizersMissingIcon from "./RealizersMissingIcon";

//const ResponsibilitiesListGroupItem = styled(ListGroupItem)`
//  display: flex;
//  justify-content: space-between;
//  &:focus {
//    outline: none;
//  }
//  &.active {
//    background-color: ${colors.responsibility};
//    border-color: ${colors.responsibility};
//    color: white;
//  }
//`;

const renderMissingRealizerIcon = (responsibility) => {
  if (!responsibility.realizer) {
    return <RealizersMissingIcon />;
  }
  return "";
};

const ResponsibilitiesList = ({
  selectedResponsibilityId,
  responsibilities,
  subscribeToResponsibilitiesEvents,
}) => {
  //const history = useHistory();
  //const { orgSlug } = useParams();

  useEffect(() => subscribeToResponsibilitiesEvents(), [
    subscribeToResponsibilitiesEvents,
  ]);

  const sortedResponsibilities = _.orderBy(
    responsibilities,
    [
      (r) => {
        if (r.title) return r.title.toLowerCase();
        return "";
      },
    ],
    ["asc"]
  );
  return (
    <List disablePadding>
      {sortedResponsibilities.map((responsibility) => (
        <ListItem
          button
          key={responsibility.nodeId}
          active={responsibility.nodeId === selectedResponsibilityId}
          onClick={
            () => null /*history.push(`/${orgSlug}/${responsibility.nodeId}`)*/
          }
        >
          {responsibility.title}
          {renderMissingRealizerIcon(responsibility)}
        </ListItem>
      ))}
    </List>
  );
};

ResponsibilitiesList.propTypes = {
  subscribeToResponsibilitiesEvents: PropTypes.func.isRequired,
  responsibilities: PropTypes.arrayOf(
    PropTypes.shape({
      nodeId: PropTypes.string,
      title: PropTypes.string,
    })
  ),
  selectedResponsibilityId: PropTypes.string,
};

ResponsibilitiesList.defaultProps = {
  responsibilities: [],
  selectedResponsibilityId: undefined,
};

export default ResponsibilitiesList;
