import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { ListGroup, ListGroupItem } from "reactstrap";
import TypeBadge from "./TypeBadge";
import RemoveDeliberation from "./RemoveDeliberation";

const StyledListGroup = styled(ListGroup)`
  margin-bottom: 2em;
`;

const StyledListGroupItem = styled(ListGroupItem)`
  position: relative;
  ${(props) => props.showremove && "padding-right: 6em;"}
`;

const RemoveWrapper = styled.span`
  position: absolute;
  top: 0.54em;
  right: 0.54em;
`;

const DeliberationList = ({ deliberations, showRemove }) => {
  const handleClick = (url) => {
    const win = window.open(url, "_blank");
    win.focus();
  };
  return (
    <StyledListGroup>
      {deliberations.map(({ node: { __typename, nodeId, title, url } }) => (
        <StyledListGroupItem
          key={nodeId}
          tag="div"
          action
          onClick={() => handleClick(url)}
          showremove={
            showRemove
              ? "true"
              : "" /* styled component doesn't want a boolean */
          }
        >
          <TypeBadge nodeType={__typename} />
          {title || url}
          {showRemove && (
            <RemoveWrapper>
              <RemoveDeliberation url={url} />
            </RemoveWrapper>
          )}
        </StyledListGroupItem>
      ))}
    </StyledListGroup>
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
