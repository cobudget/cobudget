import { useQuery, gql } from "@apollo/client";
import Link from "next/link";

import HappySpinner from "components/HappySpinner";
import thousandSeparator from "utils/thousandSeparator";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(LocalizedFormat);

export const CONTRIBUTIONS_QUERY = gql`
  query Contributions($eventId: ID!) {
    contributions(eventId: $eventId) {
      id
      amount
      createdAt
      eventMember {
        orgMember {
          user {
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
`;

const Contributions = ({ event }) => {
  const {
    data: { contributions } = { contributions: [] },
    loading,
  } = useQuery(CONTRIBUTIONS_QUERY, { variables: { eventId: event.id } });

  if (loading)
    return (
      <div className="page flex justify-center">
        <HappySpinner />
      </div>
    );

  return (
    <>
      <div className="page">
        <div className="flex justify-between mb-3 items-center">
          <h2 className="text-xl font-semibold">
            {contributions.length} contributions
          </h2>
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
      </div>
    </>
  );
};

export default Contributions;
