import React, { useEffect } from "react";
import PropTypes from "prop-types";
//import styled from "styled-components";
//import { ListGroup } from "reactstrap";
import { List } from "@material-ui/core";
import _ from "lodash";
import NeedsListItem from "./NeedsListItem";

//const NeedsListGroup = styled(ListGroup)`
//  margin-bottom: 1rem;
//`;

const NeedsList = ({
  expandedNeedId,
  setExpandedNeedId,
  needs,
  subscribeToNeedsEvents,
  highlightedNeedId,
}) => {
  useEffect(() => subscribeToNeedsEvents(), [subscribeToNeedsEvents]);

  const sortedNeeds = _.orderBy(
    needs,
    [
      (r) => {
        if (r.title) return r.title.toLowerCase();
        return "";
      },
    ],
    ["asc"]
  );
  return (
    <List className="bg-white">
      {sortedNeeds.map((need) => (
        <NeedsListItem
          key={need.nodeId}
          need={need}
          isHighlighted={need.nodeId === highlightedNeedId}
          isExpanded={need.nodeId === expandedNeedId}
          expandThisNeed={() => setExpandedNeedId(need.nodeId)}
        />
      ))}
    </List>
  );
};

NeedsList.propTypes = {
  subscribeToNeedsEvents: PropTypes.func.isRequired,
  needs: PropTypes.arrayOf(
    PropTypes.shape({
      nodeId: PropTypes.string,
      title: PropTypes.string,
    })
  ),
  highlightedNeedId: PropTypes.string,
  expandedNeedId: PropTypes.string,
  setExpandedNeedId: PropTypes.func,
};

NeedsList.defaultProps = {
  needs: [],
  highlightedNeedId: undefined,
  expandedNeedId: undefined,
  setExpandedNeedId: () => null,
};

export default NeedsList;
