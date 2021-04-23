import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { ListGroupItem, Collapse } from "reactstrap";
//import { useHistory, useParams } from "react-router-dom";
import colors from "lib/realities/colors";
//import ResponsibilitiesContainer from "./components/ResponsibilitiesContainer";
import MissingRealizersOnNeed from "./MissingRealizersOnNeed";

const ResponsibilitiesContainer = () => {
  return <div>resp container</div>;
};

const NeedsListGroupItem = styled(ListGroupItem)`
  display: flex;
  justify-content: space-between;
  &:focus {
    outline: none;
  }
  &.active {
    background-color: ${({ filledin }) => (filledin ? colors.need : "white")};
    border-color: ${colors.need};
    color: ${({ filledin }) => (filledin ? "white" : colors.need)};
  }
`;

const CollapseWrapper = styled.div`
  margin-left: 2rem;
`;

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
  //const history = useHistory();
  //const params = useParams();

  return (
    <>
      <NeedsListGroupItem
        tag="button"
        href="#"
        action
        //TODO
        //filledin={params.needId === need.nodeId ? "true" : ""}
        filledin={false}
        active={isHighlighted /*TODO: || params.needId === need.nodeId*/}
        onClick={expandThisNeed}
      >
        {need.title}
        <MissingRealizersOnNeed need={need} />
      </NeedsListGroupItem>
      <CollapseWrapper>
        <Collapse isOpen={isExpanded}>
          {need.fulfilledBy.length === 0 && (
            <div>
              This Need doesn&apos;t contain any Responsibilities yet.{" "}
              {currentUser ? "Click above to add one, or" : ""}{" "}
              <SimpleLink
                onClick={() =>
                  //TODO
                  //history.push(`/${params.orgSlug}/need/${need.nodeId}`)
                  null
                }
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
