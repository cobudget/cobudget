import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
//import { ListGroupItem, Collapse } from "reactstrap";
import { ListItem, Collapse, makeStyles } from "@material-ui/core";
//import { useHistory, useParams } from "react-router-dom";
import { useRouter } from "next/router";
import colors from "lib/realities/colors";
import ResponsibilitiesContainer from "./ResponsibilitiesContainer";
import MissingRealizersOnNeed from "./MissingRealizersOnNeed";

//const NeedsListGroupItem = styled(ListGroupItem)`
//  display: flex;
//  justify-content: space-between;
//  &:focus {
//    outline: none;
//  }
//  &.active {
//    background-color: ${({ filledin }) => (filledin ? colors.need : "white")};
//    border-color: ${colors.need};
//    color: ${({ filledin }) => (filledin ? "white" : colors.need)};
//  }
//`;

const CollapseWrapper = styled.div`
  margin-left: 2rem;
`;

const useStyles = makeStyles({
  list: {
    "background-color": ({ filledin }) => (filledin ? colors.need : ""),
    border: ({ active }) => (active ? `${colors.need} 1px solid` : ""),
    color: ({ filledin, active }) =>
      //filledin ? "white" : active ? colors.need : "",
      active ? (filledin ? "white" : colors.need) : "",
  },
});

const SimpleLink = styled.span`
  color: blue;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const NeedsListItem = ({
  currentUser,
  need,
  isHighlighted,
  isExpanded,
  expandThisNeed,
}) => {
  const router = useRouter();
  const classes = useStyles({
    filledin: router.query.needId === need.nodeId,
    active: isHighlighted || router.query.needId === need.nodeId,
  });

  console.log("ishigh", isHighlighted);
  console.log("routerneedId", router.query.needId);
  console.log("neednodeId", need.nodeId);
  console.log("filledin", router.query.needId === need.nodeId);
  console.log("active", isHighlighted || router.query.needId === need.nodeId);
  return (
    <>
      <ListItem
        button
        //TODO
        //filledin={params.needId === need.nodeId ? "true" : ""}
        onClick={expandThisNeed}
        //classes={`${
        //  isHighlighted || router.query.needId === need.nodeId
        //    ? "bg-green-200"
        //    : ""
        //}`}
        className={classes.list}
      >
        {need.title}
        <MissingRealizersOnNeed need={need} />
      </ListItem>
      <CollapseWrapper>
        <Collapse in={isExpanded}>
          {need.fulfilledBy.length === 0 && (
            <div>
              This Need doesn&apos;t contain any Responsibilities yet.{" "}
              {currentUser ? "Click above to add one, or" : ""}{" "}
              <SimpleLink
                onClick={() => router.push(`/realities/need/${need.nodeId}`)}
              >
                {/* TODO: would want to put this button on the bar for the need but
                  that wasn't working properly with bootstrap. maybe do it
                  when we're switching to another style */}
                {currentUser ? "click here" : "Click here"}
              </SimpleLink>{" "}
              to view the Need directly.
            </div>
          )}
          {isExpanded && <ResponsibilitiesContainer needId={need.nodeId} />}
        </Collapse>
      </CollapseWrapper>
    </>
  );
};

NeedsListItem.propTypes = {
  need: PropTypes.shape({
    nodeId: PropTypes.string,
    title: PropTypes.string,
    fulfilledBy: PropTypes.arrayOf(
      PropTypes.shape({
        nodeId: PropTypes.string,
      })
    ),
  }).isRequired,
  isHighlighted: PropTypes.bool,
  isExpanded: PropTypes.bool,
  expandThisNeed: PropTypes.func,
};

NeedsListItem.defaultProps = {
  isHighlighted: false,
  isExpanded: false,
  expandThisNeed: () => null,
};

export default NeedsListItem;
