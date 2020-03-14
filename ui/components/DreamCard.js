import styled from "styled-components";
import Card from "./styled/Card";
import stringToHslColor from "../utils/stringToHslColor";
import ProgressBar from "./ProgressBar";
import Link from "next/link";
import { Box } from "@material-ui/core";

import {
  ChatBubbleOutline as CommentIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from "@material-ui/icons";
import CoinIcon from "./CoinIcon";

const ActionItem = styled.div`
  display: flex;
  font-size: 16px;
  margin-right: 15px;
  align-items: center;
  color: rgba(0,0,0,0.6);
  /* color: ${props => (props.blarb ? props.hoverColor : "rgba(0,0,0,0.6)")}; */
  &:hover {
    color: ${props => props.hoverColor};
  }
  span {
    display: block;
    margin-left: 5px;
  }
`;

const DreamCard = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 100%;
  h3 {
    font-weight: 500;
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

const ImgPlaceholder = styled.div`
  background: ${props => props.color};
  flex: 0 0 200px !important;
`;

export default ({ dream }) => {
  // const [favorite, setFavorite] = React.useState(false);
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

          <p>{dream.summary}</p>
        </div>
        <div>
          {(dream.minGoalGrants || dream.maxGoalGrants) && (
            <ProgressBar
              currentNumberOfGrants={dream.currentNumberOfGrants}
              minGoalGrants={dream.minGoalGrants}
              maxGoalGrants={dream.maxGoalGrants}
            />
          )}

          <Box display="flex" mt={2}>
            {(dream.minGoalGrants || dream.maxGoalGrants) && (
              <ActionItem hoverColor="#10b92b">
                <CoinIcon />
                <span>
                  {dream.currentNumberOfGrants}/
                  {dream.maxGoalGrants || dream.minGoalGrants}
                </span>
              </ActionItem>
            )}

            <Link href="/[dream]#comments" as={`/${dream.slug}#comments`}>
              <ActionItem hoverColor="blue">
                <CommentIcon fontSize="small" />
                <span>{dream.numberOfComments} </span>
              </ActionItem>
            </Link>

            {/* <ActionItem
              hoverColor="red"
              blarb={favorite}
              onClick={e => {
                e.preventDefault();
                setFavorite(!favorite);
              }}
            >
              {favorite ? (
                <FavoriteIcon fontSize="small" />
              ) : (
                <>
                  <FavoriteBorderIcon fontSize="small" />
                </>
              )}
            </ActionItem> */}
          </Box>
        </div>
      </div>
    </DreamCard>
  );
};
