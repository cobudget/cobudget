import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import styled from "styled-components";
import Link from "next/link";
import Card from "../../components/styled/Card";
import stringToHslColor from "../../utils/stringToHslColor";
import { isMemberOfDream } from "../../utils/helpers";
import { Button, Box, Tooltip, Chip } from "@material-ui/core";
import AvatarGroup from "@material-ui/lab/AvatarGroup";

import Avatar from "../../components/Avatar";
import ProgressBar from "../../components/ProgressBar";
import GiveGrantlingsModal from "../../components/GiveGrantlingsModal";

// confusing naming, conflicting with other component.
const DreamCard = styled(Card)`
  > div {
    padding: 25px;
  }
  p {
    white-space: pre-line;
  }
  .flex {
    display: flex;
    position: relative;
  }
  .main {
    flex: 0 1 70%;
    padding-right: 20px;
  }
  .sidebar {
    flex: 0 1 30%;
    position: relative;
    top: -75px;

    h3 {
      margin-bottom: 8px;
      font-weight: 500;
      color: #000;
    }
    /* background: #f1f2f3;
    border-radius: 8px;
    padding: 15px; */
  }
`;

const StyledGrantStats = styled.div`
  display: flex;
  justify-content: space-between;
  div {
    padding: 0 8px;
    text-align: center;

    .label {
      display: block;
      text-transform: uppercase;
      font-size: 14px;
    }
    .number {
      display: block;
      margin-bottom: 8px;
      font-size: 24px;
      font-weight: 500;
    }
  }
`;

export const DREAM_QUERY = gql`
  query Dream($slug: String!, $eventId: ID!) {
    dream(slug: $slug, eventId: $eventId) {
      id
      slug
      description
      title
      minGoal
      maxGoal
      minGoalGrants
      maxGoalGrants
      currentNumberOfGrants
      members {
        id
        name
      }
      images {
        small
        large
      }
    }
  }
`;

const ImgPlaceholder = styled.div`
  background: ${props => props.color};
  flex: 0 0 200px !important;
  height: 250px;
`;

const Dream = ({ event, currentMember }) => {
  if (!event) return null;
  const router = useRouter();

  const { data: { dream } = { dream: null }, loading, error } = useQuery(
    DREAM_QUERY,
    {
      variables: { slug: router.query.dream, eventId: event.id }
    }
  );

  const [grantModalOpen, setGrantModalOpen] = React.useState(false);

  return (
    <DreamCard>
      {dream &&
        (dream.images.length > 0 ? (
          <img src={dream.images[0].large} />
        ) : (
          <ImgPlaceholder color={stringToHslColor(dream.title)} />
        ))}
      <div>
        <div className="flex">
          <div className="main">
            <h1>{dream && dream.title}</h1>
            <p>{dream && dream.description}</p>
            <h2>Budget</h2>
            <h2>Comments</h2>
          </div>
          <div className="sidebar">
            {dream && (
              <>
                <Card>
                  <Box p={2}>
                    <StyledGrantStats>
                      <div>
                        <span className="number">
                          {dream.currentNumberOfGrants}
                        </span>
                        <span className="label">Funded</span>
                      </div>
                      <div>
                        <span className="number">{dream.minGoalGrants}</span>

                        <span className="label">Min. goal</span>
                      </div>
                      <div>
                        <span className="number">{dream.maxGoalGrants}</span>

                        <span className="label">Max. goal</span>
                      </div>
                    </StyledGrantStats>

                    <Box m="16px 0px">
                      <ProgressBar
                        currentNumberOfGrants={dream.currentNumberOfGrants}
                        minGoalGrants={dream.minGoalGrants}
                        maxGoalGrants={dream.maxGoalGrants}
                        height={10}
                      />
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => setGrantModalOpen(true)}
                    >
                      Donate to dream
                    </Button>
                    <GiveGrantlingsModal
                      open={grantModalOpen}
                      handleClose={() => setGrantModalOpen(false)}
                      dream={dream}
                      event={event}
                    />
                  </Box>
                </Card>
                <Box m="16px 0">
                  <h3>Dreamers</h3>
                  <AvatarGroup>
                    {dream.members.map(member => (
                      <Tooltip key={member.id} title={member.name}>
                        <Avatar user={member} />
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </Box>
                <Box m="16px 0">
                  <h3>Tags</h3>
                  <Chip label="Dummy tag" />
                </Box>

                <Box m="16px 0">
                  <h3>Actions</h3>
                  {isMemberOfDream(currentMember, dream) && (
                    <Link href="/[dream]/edit" as={`/${dream.slug}/edit`}>
                      <Button component="a">Edit dream</Button>
                    </Link>
                  )}
                </Box>
              </>
            )}
          </div>
        </div>
      </div>
    </DreamCard>
  );
};

export default Dream;
