import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Badge } from "reactstrap";
import colors from "lib/realities/colors";

const StyledBadge = styled(Badge)`
  background-color: ${(props) => props.badgecolor};
  margin-right: 0.5em;
  min-width: 1.8em;
`;

const TypeBadge = ({ nodeType }) => (
  <StyledBadge badgecolor={colors[nodeType.toLowerCase()] || "#5a6268"}>
    {nodeType[0]}
  </StyledBadge>
);

TypeBadge.propTypes = {
  nodeType: PropTypes.string,
};

TypeBadge.defaultProps = {
  nodeType: "Need",
};

export default TypeBadge;
