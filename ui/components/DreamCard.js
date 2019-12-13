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
    margin-bottom: 5px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    display: block;
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
  transition: box-shadow 75ms ease-in-out;
  &:hover {
    box-shadow: 0 12px 20px 0 #e0e5ea;
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
const truncate = (string, n) =>
  string.length > n ? string.substr(0, n - 1) + "..." : string;

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

          <p>{truncate(dream.description, 220)}</p>
        </div>
        <FundingStats percentage={42} />
      </div>
    </DreamCard>
  );
};
