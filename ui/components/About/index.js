import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";

import thousandSeparator from "utils/thousandSeparator";

export default function AboutPage({ event }) {
  return (
    <div className="max-w-screen-md">
      {event.about && (
        <>
          <h2 className="text-xl font-semibold mb-3" id="about">
            About
          </h2>
          <div className="shadow rounded-lg bg-white p-4 pb-2 relative mb-6">
            <ReactMarkdown className="markdown" source={event.about} />
          </div>
        </>
      )}

      {Boolean(event.guidelines.length) && (
        <>
          <h2 className="text-xl font-semibold mb-3" id="guidelines">
            Guidelines
          </h2>
          <div className="shadow rounded-lg bg-white relative mb-6 divide-y divide-gray-200">
            {event.guidelines.map((guideline) => (
              <div key={guideline.id} className="p-4 pb-2">
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

      <h2 className="text-xl font-semibold mb-3">Granting settings</h2>
      <div className="bg-white rounded-lg shadow mb-6">
        <List>
          <ListItem>
            <ListItemText primary={"Currency"} secondary={event.currency} />
          </ListItem>

          {event.maxAmountToDreamPerUser && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Max. amount to one dream per user"
                  secondary={`${thousandSeparator(
                    event.maxAmountToDreamPerUser / 100
                  )} ${event.currency}`}
                />
              </ListItem>
            </>
          )}
          <Divider />

          <ListItem>
            <ListItemText
              primary="Allow stretch goals"
              secondary={event.allowStretchGoals.toString()}
            />
          </ListItem>

          {event.dreamCreationCloses && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Dream creation closes"
                  secondary={dayjs(event.dreamCreationCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
          {event.grantingOpens && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Granting opens"
                  secondary={dayjs(event.grantingOpens).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
          {event.grantingCloses && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Granting closes"
                  secondary={dayjs(event.grantingCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
        </List>
      </div>

      <h2 className="text-xl font-semibold mb-3">Granting status</h2>
      <div className="bg-white rounded-lg shadow mb-6">
        <List>
          <ListItem>
            <ListItemText
              primary="Total allocations"
              secondary={`${thousandSeparator(event.totalAllocations / 100)} ${
                event.currency
              }`}
            />
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText
              primary="Total contributions"
              secondary={`${thousandSeparator(
                event.totalContributions / 100
              )} ${event.currency}`}
            />
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText
              primary="Total in members balances (allocations - contributions)"
              secondary={`${thousandSeparator(
                event.totalInMembersBalances / 100
              )} ${event.currency}`}
            />
          </ListItem>

          <Divider />
          <ListItem>
            <ListItemText
              primary="Total contributions in funding now dreams"
              secondary={`${thousandSeparator(
                event.totalContributionsFunding / 100
              )} ${event.currency}`}
            />
          </ListItem>

          <Divider />
          <ListItem>
            <ListItemText
              primary="Total contributions in funded dreams"
              secondary={`${thousandSeparator(
                event.totalContributionsFunded / 100
              )} ${event.currency}`}
            />
          </ListItem>
        </List>
      </div>
    </div>
  );
}
