import {
  List,
  Typography,
  Modal,
  Box,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from "@material-ui/core";
import { Edit as EditIcon, Add as AddIcon } from "@material-ui/icons";

import { makeStyles } from "@material-ui/core/styles";
import gql from "graphql-tag";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";

import SettingsListItem from "./SettingsListItem";
import SetCurrency from "./SetCurrency";
import SetGrantsPerMember from "./SetGrantsPerMember";
import SetMaxGrantsToDream from "./SetMaxGrantsToDream";
import SetTotalBudget from "./SetTotalBudget";
import SetGrantValue from "./SetGrantValue";
import SetDreamCreationCloses from "./SetDreamCreationCloses";
import SetGrantingCloses from "./SetGrantingCloses";
import SetGrantingOpens from "./SetGrantingOpens";
import SetGuidelines from "./SetGuidelines";
import SetAllowStretchGoals from "./SetAllowStretchGoals";
import SetAbout from "./SetAbout";
import thousandSeparator from "../../utils/thousandSeparator";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center",
  },
  innerModal: {
    outline: "none",
    flex: "0 1 500px",
  },
}));

const modals = {
  SET_CURRENCY: SetCurrency,
  SET_DREAM_CREATION_CLOSES: SetDreamCreationCloses,
  SET_GRANTING_OPENS: SetGrantingOpens,
  SET_GRANTING_CLOSES: SetGrantingCloses,
  SET_GRANT_VALUE: SetGrantValue,
  SET_GRANTS_PER_MEMBER: SetGrantsPerMember,
  SET_MAX_GRANTS_TO_DREAM: SetMaxGrantsToDream,
  SET_TOTAL_BUDGET: SetTotalBudget,
  SET_GUIDELINES: SetGuidelines,
  SET_ALLOW_STRETCH_GOALS: SetAllowStretchGoals,
  SET_ABOUT: SetAbout,
};

export const UPDATE_GRANTING_SETTINGS = gql`
  mutation updateGrantingSettings(
    $eventId: ID!
    $currency: String
    $grantsPerMember: Int
    $maxGrantsToDream: Int
    $totalBudget: Int
    $grantValue: Int
    $grantingOpens: Date
    $grantingCloses: Date
    $dreamCreationCloses: Date
    $allowStretchGoals: Boolean
  ) {
    updateGrantingSettings(
      eventId: $eventId
      currency: $currency
      grantsPerMember: $grantsPerMember
      maxGrantsToDream: $maxGrantsToDream
      totalBudget: $totalBudget
      grantValue: $grantValue
      grantingOpens: $grantingOpens
      grantingCloses: $grantingCloses
      dreamCreationCloses: $dreamCreationCloses
      allowStretchGoals: $allowStretchGoals
    ) {
      id
      currency
      grantsPerMember
      maxGrantsToDream
      totalBudget
      grantValue
      grantingOpens
      grantingCloses
      grantingIsOpen
      dreamCreationCloses
      dreamCreationIsOpen
      allowStretchGoals
    }
  }
`;

export default ({ event, currentUser }) => {
  const [open, setOpen] = React.useState(null);

  const handleOpen = (modal) => {
    setOpen(modal);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const classes = useStyles();

  const ModalContent = modals[open];

  const grantingHasOpened = dayjs(event.grantingOpens).isBefore(dayjs());

  const canEditSettings =
    currentUser && currentUser.membership && currentUser.membership.isAdmin;

  return (
    <>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={Boolean(open)}
        onClose={handleClose}
        className="flex items-start justify-center p-4 sm:pt-24 overflow-y-scroll"
      >
        <div className={classes.innerModal}>
          {open && <ModalContent event={event} closeModal={handleClose} />}
        </div>
      </Modal>
      {(event.about || currentUser?.membership?.isAdmin) && (
        <>
          <h2 className="text-xl mb-3" id="about">
            About
          </h2>
          <div className="shadow rounded-lg bg-white p-4 relative mb-4">
            {event.about ? (
              <>
                {currentUser?.membership?.isAdmin && (
                  <div className="absolute right-0 top-0 m-4">
                    <IconButton onClick={() => handleOpen("SET_ABOUT")}>
                      <EditIcon />
                    </IconButton>
                  </div>
                )}
                <ReactMarkdown className="markdown" source={event.about} />
              </>
            ) : (
              <div className="flex justify-center">
                <IconButton onClick={() => handleOpen("SET_ABOUT")}>
                  <AddIcon />
                </IconButton>
              </div>
            )}
          </div>
        </>
      )}

      {(event.guidelinesMarkdown || currentUser?.membership?.isAdmin) && (
        <>
          <h2 className="text-xl mb-3" id="guidelines">
            Guidelines
          </h2>
          <div className="shadow rounded-lg bg-white p-4 relative mb-4">
            {event.guidelinesMarkdown ? (
              <>
                {currentUser?.membership?.isAdmin && (
                  <div className="absolute right-0 top-0 m-4">
                    <IconButton onClick={() => handleOpen("SET_GUIDELINES")}>
                      <EditIcon />
                    </IconButton>
                  </div>
                )}
                <ReactMarkdown
                  className="markdown"
                  source={event.guidelinesMarkdown}
                />
              </>
            ) : (
              <div className="flex justify-center">
                <IconButton onClick={() => handleOpen("SET_GUIDELINES")}>
                  <AddIcon />
                </IconButton>
              </div>
            )}
          </div>
        </>
      )}

      <h2 className="text-xl mb-3">Granting settings</h2>
      <div className="bg-white rounded-lg shadow mb-4">
        <List>
          <SettingsListItem
            primary="Currency"
            secondary={event.currency}
            isSet={event.currency}
            disabled={!event.dreamCreationIsOpen}
            openModal={() => handleOpen("SET_CURRENCY")}
            canEdit={canEditSettings}
          />

          <Divider />

          <SettingsListItem
            primary="Grants per member"
            secondary={event.grantsPerMember}
            isSet={event.grantsPerMember}
            disabled={grantingHasOpened}
            openModal={() => handleOpen("SET_GRANTS_PER_MEMBER")}
            canEdit={canEditSettings}
          />

          <Divider />

          <SettingsListItem
            primary="Max. grants to one dream per user"
            secondary={
              event.maxGrantsToDream ? event.maxGrantsToDream : "Not set"
            }
            isSet={event.maxGrantsToDream}
            disabled={grantingHasOpened}
            openModal={() => handleOpen("SET_MAX_GRANTS_TO_DREAM")}
            canEdit={canEditSettings}
          />

          <Divider />

          <SettingsListItem
            primary="Total budget"
            secondary={
              event.totalBudget
                ? `${thousandSeparator(event.totalBudget)} ${event.currency}`
                : "Not set"
            }
            isSet={event.totalBudget}
            disabled={grantingHasOpened}
            openModal={() => handleOpen("SET_TOTAL_BUDGET")}
            canEdit={canEditSettings}
          />

          <Divider />

          <SettingsListItem
            primary="Grant value"
            secondary={
              event.grantValue
                ? `${thousandSeparator(event.grantValue)} ${event.currency}`
                : "Not set"
            }
            isSet={event.grantValue}
            disabled={grantingHasOpened}
            openModal={() => handleOpen("SET_GRANT_VALUE")}
            canEdit={canEditSettings}
          />

          <Divider />

          <SettingsListItem
            primary="Allow stretch goals"
            secondary={event.allowStretchGoals.toString()}
            isSet={typeof event.allowStretchGoals !== "undefined"}
            disabled={grantingHasOpened}
            openModal={() => handleOpen("SET_ALLOW_STRETCH_GOALS")}
            canEdit={canEditSettings}
          />

          <Divider />

          <SettingsListItem
            primary="Dream creation closes"
            secondary={
              event.dreamCreationCloses
                ? dayjs(event.dreamCreationCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )
                : "Not set"
            }
            isSet={event.dreamCreationCloses}
            disabled={grantingHasOpened}
            openModal={() => handleOpen("SET_DREAM_CREATION_CLOSES")}
            canEdit={canEditSettings}
          />

          <Divider />

          <SettingsListItem
            primary="Granting opens"
            secondary={
              event.grantingOpens
                ? dayjs(event.grantingOpens).format("MMMM D, YYYY - h:mm a")
                : "Not set"
            }
            isSet={event.grantingOpens}
            openModal={() => handleOpen("SET_GRANTING_OPENS")}
            disabled={
              !event.dreamCreationCloses ||
              !event.totalBudget ||
              !event.grantValue
            }
            canEdit={canEditSettings}
          />

          <Divider />

          <SettingsListItem
            primary="Granting closes"
            secondary={
              event.grantingCloses
                ? dayjs(event.grantingCloses).format("MMMM D, YYYY - h:mm a")
                : "Not set"
            }
            isSet={event.grantingCloses}
            openModal={() => handleOpen("SET_GRANTING_CLOSES")}
            disabled={!event.grantingOpens}
            canEdit={canEditSettings}
          />
        </List>
      </div>

      <h2 className="text-xl mb-3">Granting status</h2>
      <div className="bg-white rounded-lg shadow mb-4">
        <List>
          <ListItem>
            <ListItemText
              primary="Granting is"
              secondary={event.grantingIsOpen ? "OPEN" : "CLOSED"}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Unallocated grants in budget"
              secondary={`${event.remainingGrants} grants`}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Total grants in budget"
              secondary={`${event.totalBudgetGrants} grants`}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Grants given"
              secondary={`${
                event.totalBudgetGrants - event.remainingGrants
              } grants`}
            />
          </ListItem>
        </List>
      </div>
    </>
  );
};
