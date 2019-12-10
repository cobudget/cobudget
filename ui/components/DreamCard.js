import styled from "styled-components";
import Link from "next/link";
import Card from "./styled/Card";
import stringToHslColor from "../utils/stringToHslColor";

const DreamCard = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0px;
  h3 {
    font-family: "Inter-SemiBold";
    margin-bottom: 5px;
  }
  p {
    color: #333;
    line-height: 1.4;
  }
  > div {
    padding: 15px;
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    justify-content: space-between;
  }
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    object-position: center;
  }
`;

const StyledProgressBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.075);
  margin: 10px 0px;
  .filler {
    width: ${props => props.percentage}%;
    height: 100%;
    background: #10b92b;
    border-radius: inherit;
  }
`;

const ProgressBar = ({ percentage = 20 }) => {
  return (
    <StyledProgressBar percentage={percentage}>
      <div className="filler" />
    </StyledProgressBar>
  );
};

const StyledFundingStats = styled.p`
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
`;

const FundingStats = ({ percentage = 0 }) => {
  return (
    <div>
      <ProgressBar percentage={percentage} />
      <StyledFundingStats>{percentage}% funded</StyledFundingStats>
    </div>
  );
};

const ImgPlaceholder = styled.div`
  background: ${props => props.color};
  flex: 0 0 200px !important;
`;

export default ({ dream }) => {
  return (
    <DreamCard>
      {dream.images.length ? (
        <img src={dream.images[0].small} />
      ) : (
        <ImgPlaceholder color={stringToHslColor(dream.title)} />
      )}
      <div>
        <div>
          <h3>{dream.title}</h3>

          <p>{dream.description}</p>
        </div>
        <FundingStats percentage={42} />
      </div>
    </DreamCard>
  );
};

// When opening dream, have it open as an overlay, unless you serverside render.. This would be very neat. Allows easier browsing..
