import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import styled from "styled-components";
import Link from "next/link";
import Router from "next/router";
import {
  Button,
  Box,
  Tooltip,
  IconButton,
  Typography,
  TableHead,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper
} from "@material-ui/core";
import AvatarGroup from "@material-ui/lab/AvatarGroup";
import { Edit as EditIcon } from "@material-ui/icons";

import stringToHslColor from "../../utils/stringToHslColor";
import { isMemberOfDream } from "../../utils/helpers";
import Card from "../../components/styled/Card";
import Avatar from "../../components/Avatar";
import Gallery from "../../components/Gallery";
import GiveGrantlingsModal from "../../components/GiveGrantlingsModal";
import PreOrPostFundModal from "../../components/PreOrPostFundModal";
import ProgressBar from "../../components/ProgressBar";

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
      summary
      title
      minGoal
      maxGoal
      minGoalGrants
      maxGoalGrants
      currentNumberOfGrants
      approved
      members {
        id
        name
      }
      images {
        small
        large
      }
      budgetItems {
        description
        amount
      }
    }
  }
`;

const APPROVE_FOR_GRANTING_MUTATION = gql`
  mutation ApproveForGranting($dreamId: ID!, $approved: Boolean!) {
    approveForGranting(dreamId: $dreamId, approved: $approved) {
      id
      approved
    }
  }
`;

const RECLAIM_GRANTS_MUTATION = gql`
  mutation ReclaimGrants($dreamId: ID!) {
    reclaimGrants(dreamId: $dreamId) {
      id
      currentNumberOfGrants
    }
  }
`;

const ImgPlaceholder = styled.div`
  background: ${props => props.bgColor};
  flex: 0 0 200px !important;
  height: 350px;
`;

const CoverImg = styled.img`
  width: 100%;
  background: ${props => props.bgColor};

  height: 350px;
  object-fit: cover;
  object-position: center center;
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

  const [approveForGranting] = useMutation(APPROVE_FOR_GRANTING_MUTATION);
  const [reclaimGrants] = useMutation(RECLAIM_GRANTS_MUTATION);

  const [grantModalOpen, setGrantModalOpen] = React.useState(false);
  const [prePostFundModalOpen, setPrePostFundModalOpen] = React.useState(false);

  return (
    <DreamCard>
      {dream &&
        (dream.images.length > 0 ? (
          <CoverImg
            src={dream.images[0].large}
            bgColor={stringToHslColor(dream.title)}
          />
        ) : (
          <ImgPlaceholder bgColor={stringToHslColor(dream.title)} />
        ))}
      <div>
        <div className="flex">
          <div className="main">
            <Box
              display="flex"
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <h1>{dream && dream.title}</h1>
              {isMemberOfDream(currentMember, dream) && (
                <IconButton onClick={() => Router.push(`/${dream.slug}/edit`)}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
            <p>{dream && dream.summary}</p>
            <br></br>
            {dream && <Gallery images={dream.images} size={100} />}
            <br />
            <Typography>{dream && dream.description}</Typography>

            {dream && dream.minGoal && (
              <Box my={3}>
                <Typography variant="h6">Funding goals</Typography>
                <Typography>
                  Min goal: {dream.minGoal} {event.currency}
                </Typography>
                {dream.maxGoal && (
                  <Typography>
                    Max goal: {dream.maxGoal} {event.currency}
                  </Typography>
                )}
              </Box>
            )}

            {dream && dream.budgetItems.length > 0 && (
              <>
                <Box my={3}>
                  <Typography variant="h6">Budget items</Typography>
                  <TableContainer component={Paper}>
                    <Table aria-label="Budget items">
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dream.budgetItems.map((budgetItem, i) => (
                          <TableRow key={i}>
                            <TableCell component="th" scope="row">
                              {budgetItem.description}
                            </TableCell>
                            <TableCell align="right">
                              {budgetItem.amount} {event.currency}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </>
            )}
            <Typography variant="h6">Comments</Typography>
          </div>
          <div className="sidebar">
            {dream && (
              <>
                <Card>
                  <Box p={2}>
                    {dream.approved ? (
                      <>
                        <StyledGrantStats>
                          <div>
                            <span className="number">
                              {dream.currentNumberOfGrants}
                            </span>
                            <span className="label">Funded</span>
                          </div>
                          <div>
                            <span className="number">
                              {dream.minGoalGrants}
                            </span>

                            <span className="label">Min. goal</span>
                          </div>
                          <div>
                            <span className="number">
                              {dream.maxGoalGrants}
                            </span>

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
                        {currentMember && currentMember.availableGrants > 0 && (
                          <>
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
                              currentMember={currentMember}
                            />
                          </>
                        )}
                      </>
                    ) : (
                      <p>This dream is not approved for granting yet</p>
                    )}
                  </Box>
                </Card>
                <Box m="16px 0">
                  <h3>Dreamers</h3>
                  <Box p="0 8px">
                    <AvatarGroup>
                      {dream.members.map(member => (
                        <Tooltip key={member.id} title={member.name}>
                          <Avatar user={member} />
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  </Box>
                </Box>
                {/* <Box m="16px 0">
                  <h3>Tags</h3>
                  <Chip label="Dummy tag" />
                </Box> */}

                {currentMember && currentMember.isAdmin && (
                  <>
                    <Box m="16px 0">
                      <h3>Admin actions</h3>
                      {!event.grantingHasClosed && dream.approved ? (
                        <Button
                          onClick={() =>
                            confirm(
                              "Are you sure you would like to unapprove this dream?"
                            ) &&
                            approveForGranting({
                              variables: {
                                dreamId: dream.id,
                                approved: false
                              }
                            }).catch(err => alert(err.message))
                          }
                        >
                          Unapprove for granting
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() =>
                            approveForGranting({
                              variables: { dreamId: dream.id, approved: true }
                            }).catch(err => alert(err.message))
                          }
                        >
                          Approve for granting
                        </Button>
                      )}
                      <br />
                      {event.grantingHasClosed &&
                        dream.currentNumberOfGrants > 0 && (
                          <>
                            <Button
                              onClick={() =>
                                reclaimGrants({
                                  variables: { dreamId: dream.id }
                                }).catch(err => alert(err.message))
                              }
                            >
                              Reclaim grants
                            </Button>
                            <br />
                          </>
                        )}
                      {dream.approved && (
                        <>
                          <Button onClick={() => setPrePostFundModalOpen(true)}>
                            {event.grantingHasClosed ? "Post-fund" : "Pre-fund"}
                          </Button>
                          <PreOrPostFundModal
                            open={prePostFundModalOpen}
                            handleClose={() => setPrePostFundModalOpen(false)}
                            dream={dream}
                            event={event}
                          />
                        </>
                      )}
                    </Box>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DreamCard>
  );
};

export default Dream;
