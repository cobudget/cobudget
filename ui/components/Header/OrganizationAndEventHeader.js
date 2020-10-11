import { useState } from "react";
import Link from "next/link";
import { Tooltip } from "react-tippy";
import { HomeIcon, DotsHorizontalIcon, ChevronArrowRightIcon } from "components/Icons";
import EventSettingsModal from "components/EventSettingsModal";
import IconButton from "components/IconButton";

export default ({currentOrg, event, currentUser}) => {
  const [eventSettingsModalOpen, setEventSettingsModalOpen] = useState(false);
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
            <h1>{event.title}</h1>
          </a>
        </Link>
        {(currentUser?.membership?.isAdmin ||
          currentUser?.isOrgAdmin) && (
          <>
            <Tooltip
              title="Event settings"
              position="bottom"
              size="small"
            >
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
                currentUser={currentUser}
                handleClose={() => setEventSettingsModalOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </>
  )
}