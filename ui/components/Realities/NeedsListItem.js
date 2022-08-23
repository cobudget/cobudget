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
import { FormattedMessage, useIntl } from "react-intl";

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
    "&:hover": {
      "background-color": ({ filledin }) => (filledin ? colors.need : ""),
    },
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

  return (
    <>
      <ListItem button onClick={expandThisNeed} className={classes.list}>
        {need.title}
        <MissingRealizersOnNeed need={need} />
      </ListItem>
      <CollapseWrapper>
        <Collapse in={isExpanded}>
          {need.fulfilledBy.length === 0 && (
            <div>
              {/* TODO: would want to put this button on the bar for the need but
                  that wasn't working properly with bootstrap. maybe do it
                  when we're switching to another style */}
              {currentUser ? (
                <FormattedMessage
                  defaultMessage="This need doesn't contain any responsibilities yet. <a>Click here</a> to view the need directly"
                  values={{
                    a: (msg) => (
                      <SimpleLink
                        onClick={() =>
                          router.push(`/realities/need/${need.nodeId}`)
                        }
                      >
                        {msg}
                      </SimpleLink>
                    ),
                  }}
                />
              ) : (
                <FormattedMessage
                  defaultMessage="This need doesn't contain any responsibilities yet. Click above to add one, or <a>click here</a> to view the need directly"
                  values={{
                    a: (msg) => (
                      <SimpleLink
                        onClick={() =>
                          router.push(`/realities/need/${need.nodeId}`)
                        }
                      >
                        {msg}
                      </SimpleLink>
                    ),
                  }}
                />
              )}
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
