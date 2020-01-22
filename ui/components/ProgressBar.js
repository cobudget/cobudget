import styled from "styled-components";

const StyledProgressBar = styled.div`
  height: ${props => props.height}px;
  border-radius: ${props => props.height / 2}px;
  background: #e5e5e5;
  margin: 10px 0px;

  position: relative;
  .filler {
    width: ${props =>
      (props.currentNumberOfGrants / props.maxGoalGrants) * 100}%;
    height: 100%;
    background: #10b92b;
    border-radius: inherit;
  }
  .dot {
    width: ${props => props.height * 2}px;
    height: ${props => props.height * 2}px;
    background: ${props =>
      props.currentNumberOfGrants >= props.minGoalGrants
        ? "#10b92b"
        : "#E5E5E5"};
    border: ${props => props.height / 3}px solid
      ${props =>
        props.currentNumberOfGrants >= props.minGoalGrants
          ? "#00920f"
          : "#ABABAB"};
    border-radius: ${props => props.height}px;
    position: absolute;
    left: calc(
      ${props => (props.minGoalGrants / props.maxGoalGrants) * 100}% -
        ${props => props.height}px
    );
    top: -${props => props.height / 2}px;
  }
`;

const ProgressBar = ({
  currentNumberOfGrants,
  minGoalGrants,
  maxGoalGrants,
  height = 6
}) => {
  return (
    <StyledProgressBar
      currentNumberOfGrants={currentNumberOfGrants}
      minGoalGrants={minGoalGrants}
      maxGoalGrants={maxGoalGrants || minGoalGrants}
      height={height}
    >
      <div className="filler" />
      <div className="dot" />
    </StyledProgressBar>
  );
};

export default ProgressBar;
