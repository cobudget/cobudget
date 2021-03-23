import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";

import thousandSeparator from "utils/thousandSeparator";

export default ({ event }) => {
  return (
    <>
      {event.about && (
        <>
          <h2 className="text-xl mb-3" id="about">
            About
          </h2>
          <div className="shadow rounded-lg bg-white p-4 relative mb-6">
            <ReactMarkdown className="markdown" source={event.about} />
          </div>
        </>
      )}

      {Boolean(event.guidelines.length) && (
        <>
          <h2 className="text-xl mb-3" id="guidelines">
            Guidelines
          </h2>
          <div className="shadow rounded-lg bg-white relative mb-6">
            {event.guidelines.map((guideline) => (
              <div className="border-b first:border-0 p-4">
                <h3 className="text-lg font-medium">{guideline.title}</h3>
                <ReactMarkdown
                  className="markdown"
                  source={guideline.description}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl mb-3">Granting settings</h2>
      <div className="bg-white rounded-lg shadow mb-6">
        <List>
          <ListItem>
            <ListItemText primary={"Currency"} secondary={event.currency} />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemText
              primary="Tokens per member"
              secondary={event.grantsPerMember}
            />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemText
              primary="Max. tokens to one dream per user"
              secondary={
                event.maxGrantsToDream ? event.maxGrantsToDream : "Not set"
              }
            />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemText
              primary="Total budget"
              secondary={
                event.totalBudget
                  ? `${thousandSeparator(event.totalBudget)} ${event.currency}`
                  : "Not set"
              }
            />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemText
              primary="Grant value"
              secondary={
                event.grantValue
                  ? `${thousandSeparator(event.grantValue)} ${event.currency}`
                  : "Not set"
              }
            />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemText
              primary="Allow stretch goals"
              secondary={event.allowStretchGoals.toString()}
            />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemText
              primary="Dream creation closes"
              secondary={
                event.dreamCreationCloses
                  ? dayjs(event.dreamCreationCloses).format(
                      "MMMM D, YYYY - h:mm a"
                    )
                  : "Not set"
              }
            />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemText
              primary="Granting opens"
              secondary={
                event.grantingOpens
                  ? dayjs(event.grantingOpens).format("MMMM D, YYYY - h:mm a")
                  : "Not set"
              }
            />
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemText
              primary="Granting closes"
              secondary={
                event.grantingCloses
                  ? dayjs(event.grantingCloses).format("MMMM D, YYYY - h:mm a")
                  : "Not set"
              }
            />
          </ListItem>
        </List>
      </div>

      <h2 className="text-xl mb-3">Granting status</h2>
      <div className="bg-white rounded-lg shadow mb-6">
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
              primary="Unallocated tokens in budget"
              secondary={`${event.remainingGrants} tokens`}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Total tokens in budget"
              secondary={`${event.totalBudgetGrants} tokens`}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Tokens given"
              secondary={`${
                event.totalBudgetGrants - event.remainingGrants
              } tokens`}
            />
          </ListItem>
        </List>
      </div>
    </>
  );
};
