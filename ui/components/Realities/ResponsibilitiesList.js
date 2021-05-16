import React, { useEffect } from "react";
import PropTypes from "prop-types";
//import styled from "styled-components";
//import { useHistory, useParams } from "react-router-dom";
//import { ListGroup, ListGroupItem } from "reactstrap";
import { List, ListItem, makeStyles } from "@material-ui/core";
import _ from "lodash";
import { useRouter } from "next/router";
import colors from "lib/realities/colors";
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

const useStyles = makeStyles({
  item: {
    "background-color": ({ active }) =>
      active ? `${colors.responsibility}` : "",
    "&:hover": {
      "background-color": ({ active }) =>
        active ? `${colors.responsibility}` : "",
    },
    border: ({ active }) =>
      active ? `${colors.responsibility} 1px solid` : "",
    color: ({ active }) => (active ? "white" : ""),
  },
});

const renderMissingRealizerIcon = (responsibility) => {
  if (!responsibility.realizer) {
    return <RealizersMissingIcon />;
  }
  return "";
};

const RespItem = ({ resp, selectedRespId }) => {
  const router = useRouter();

  const classes = useStyles({
    active: resp.nodeId === selectedRespId,
  });

  return (
    <ListItem
      button
      onClick={() => router.push(`/realities/${resp.nodeId}`)}
      className={classes.item}
    >
      {resp.title}
      {renderMissingRealizerIcon(resp)}
    </ListItem>
  );
};

const ResponsibilitiesList = ({
  selectedRespId,
  responsibilities,
  subscribeToResponsibilitiesEvents,
}) => {
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
      {sortedResponsibilities.map((resp) => (
        <RespItem
          key={resp.nodeId}
          resp={resp}
          selectedRespId={selectedRespId}
        />
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
  selectedRespId: PropTypes.string,
};

ResponsibilitiesList.defaultProps = {
  responsibilities: [],
  selectedRespId: undefined,
};

export default ResponsibilitiesList;
