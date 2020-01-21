import styled from "styled-components";

const StyledProgressBar = styled.div`
  height: 6px;
  border-radius: 3px;
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
    width: 12px;
    height: 12px;
    background: ${props =>
      props.currentNumberOfGrants >= props.minGoalGrants
        ? "#10b92b"
        : "#E5E5E5"};
    border: 2px solid
      ${props =>
        props.currentNumberOfGrants >= props.minGoalGrants
          ? "#00920f"
          : "#ABABAB"};
    border-radius: 6px;
    position: absolute;
    left: calc(
      ${props => (props.minGoalGrants / props.maxGoalGrants) * 100}% - 6px
    );
    top: -3px;
  }
`;

const ProgressBar = ({
  currentNumberOfGrants,
  minGoalGrants,
  maxGoalGrants
}) => {
  return (
    <StyledProgressBar
      currentNumberOfGrants={currentNumberOfGrants}
      minGoalGrants={minGoalGrants}
      maxGoalGrants={maxGoalGrants || minGoalGrants}
    >
      <div className="filler" />
      <div className="dot" />
    </StyledProgressBar>
  );
};

const StyledFundingStats = styled.p`
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`;

const FundingStats = ({
  currentNumberOfGrants,
  minGoalGrants,
  maxGoalGrants
}) => {
  const maxGoal = maxGoalGrants || minGoalGrants;

  if (maxGoal) {
    return (
      <div>
        <ProgressBar
          currentNumberOfGrants={currentNumberOfGrants}
          minGoalGrants={minGoalGrants}
          maxGoalGrants={maxGoalGrants}
        />
        <StyledFundingStats>
          {currentNumberOfGrants}/{maxGoal} funded
        </StyledFundingStats>
      </div>
    );
  }
  return null;
};

export default FundingStats;
