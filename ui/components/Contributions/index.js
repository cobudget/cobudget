import { useQuery, gql } from "@apollo/client";
import Link from "next/link";

import HappySpinner from "components/HappySpinner";
import thousandSeparator from "utils/thousandSeparator";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import LoadMore from "components/LoadMore";
dayjs.extend(LocalizedFormat);

export const CONTRIBUTIONS_QUERY = gql`
  query Contributions($eventId: ID!, $offset: Int, $limit: Int) {
    contributionsPage(eventId: $eventId, offset: $offset, limit: $limit) {
      moreExist
      contributions(eventId: $eventId, offset: $offset, limit: $limit) {
        id
        amount
        createdAt
        eventMember {
          id
          orgMember {
            id
            user {
              id
              username
            }
          }
        }
        dream {
          id
          title
        }
      }
    }
  }
`;

const Contributions = ({ event }) => {
  const {
    data: { contributionsPage: { moreExist, contributions } } = {
      contributionsPage: { contributions: [] },
    },
    loading,
    fetchMore,
  } = useQuery(CONTRIBUTIONS_QUERY, {
    notifyOnNetworkStatusChange: true,
    variables: { eventId: event.id, offset: 0, limit: 2 },
  });

  return (
    <>
      <div className="page">
        <div className="flex justify-between mb-3 items-center">
          <h2 className="text-xl font-semibold">All contributions</h2>
        </div>
        {!!contributions.length && (
          <div className="bg-white divide-y-default divide-gray-200 py-1 rounded shadow">
            {contributions.map((c) => (
              <div
                className="px-4 py-2 text-gray-800 flex items-center justify-between text-sm"
                key={c.id}
              >
                <div>
                  <span className="text-gray-500 mr-4">
                    {dayjs(c.createdAt).format("LLL")}
                  </span>
                  @{c.eventMember.orgMember.user.username} funded{" "}
                  <Link href={`/${event.slug}/${c.dream.id}`}>
                    <a className="font-semibold hover:underline">
                      {c.dream.title}
                    </a>
                  </Link>
                </div>
                <span className="text-green-700 font-semibold">
                  {thousandSeparator(c.amount / 100)} {event.currency}
                </span>
              </div>
            ))}
          </div>
        )}
        <LoadMore
          moreExist={moreExist}
          loading={loading}
          onClick={() =>
            fetchMore({ variables: { offset: contributions.length } })
          }
        />
      </div>
    </>
  );
};

export default Contributions;
