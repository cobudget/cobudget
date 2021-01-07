import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Tooltip } from "react-tippy";
import {
  HomeIcon,
  DotsHorizontalIcon,
  ChevronArrowRightIcon,
} from "components/Icons";
import EventSettingsModal from "components/EventSettingsModal";
import IconButton from "components/IconButton";

const DREAM_QUERY = gql`
  query Dream($id: ID!) {
    dream(id: $id) {
      title
    }
  }
`;

export default ({ currentOrg, event, currentOrgMember }) => {
  const [eventSettingsModalOpen, setEventSettingsModalOpen] = useState(false);
  const router = useRouter();
  const { data: { dream } = { dream: null }, loading, error } = useQuery(
    DREAM_QUERY,
    {
      variables: { id: router.query.dream },
    }
  );

  return (
    <>
      <Tooltip
        title={currentOrg?.name ?? `See all events`}
        position="bottom"
        size="small"
      >
        <div className="">
          <Link href="/">
            {currentOrg?.logo ? (
              <a
                className={
                  "block rounded overflow-hidden opacity-50 hover:opacity-100 transition-opacity duration-100"
                }
              >
                <img className="h-7 w-7" src={currentOrg?.logo} />
              </a>
            ) : (
              <a
                className={
                  "block p-1 rounded-md " +
                  (event.color
                    ? `text-white opacity-75 hover:opacity-100 hover:bg-${event.color}-darker`
                    : "hover:bg-gray-200 text-gray-500 hover:text-gray-800")
                }
              >
                <HomeIcon className="h-5 w-5 " />
              </a>
            )}
          </Link>
        </div>
      </Tooltip>

      <ChevronArrowRightIcon className={`w-5 h-5 text-white`} />

      <div className="group flex items-center">
        <Link href="/[event]" as={`/${event.slug}`}>
          <a
            className={`hover:bg-${event.color}-darker px-2 py-1 text-white rounded-md mx-0 font-medium`}
          >
            <h1>
              {event.title.length <= 30
                ? event.title
                : event.title.substr(0, 30) + "..."}
            </h1>
          </a>
        </Link>

        {/* We need to check both the dream and the router to prevent caching to appear */}
        {dream && router.query?.dream && (
          <>
            <ChevronArrowRightIcon className={`w-5 h-5 text-white`} />
            <span
              className={"px-2 py-1 text-white rounded-md mx-0 font-medium"}
            >
              <h1>
                {dream.title.length <= 30
                  ? dream.title
                  : dream.title.substr(0, 30) + "..."}
              </h1>
            </span>
          </>
        )}

        {(currentOrgMember?.currentEventMembership?.isAdmin ||
          currentOrgMember?.isOrgAdmin) && (
          <>
            <Tooltip title="Event settings" position="bottom" size="small">
              <IconButton
                onClick={() => setEventSettingsModalOpen(true)}
                className={
                  event.color
                    ? `text-white bg-${event.color} hover:bg-${event.color}-darker opacity-75 hover:opacity-100`
                    : "text-gray-500 hover:text-gray-800"
                }
              >
                <DotsHorizontalIcon className="h-4 w-4" />
              </IconButton>
            </Tooltip>
            {eventSettingsModalOpen && (
              <EventSettingsModal
                event={event}
                currentOrgMember={currentOrgMember}
                handleClose={() => setEventSettingsModalOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};
