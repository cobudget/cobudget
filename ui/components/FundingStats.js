import styled from "styled-components";
import ProgressBar from "./ProgressBar";

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
