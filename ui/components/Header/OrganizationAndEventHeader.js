import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import { ChevronArrowRightIcon } from "components/Icons";

const DREAM_QUERY = gql`
  query Dream($id: ID!) {
    dream(id: $id) {
      title
    }
  }
`;

const OrganizationAndEventHeader = ({ currentOrg, event, router, color }) => {
  // const { data: { dream } = { dream: null } } = useQuery(DREAM_QUERY, {
  //   variables: { id: router.query.dream },
  //   skip: !router.query.dream,
  // });

  return (
    <div className="space-x-2 flex items-center">
      {currentOrg ? (
        <Link href="/">
          <a
            className={
              "px-2 py-1 rounded-md flex items-center group space-x-2 " +
              `text-white hover:bg-${color}-dark`
            }
          >
            {currentOrg.logo && (
              <img
                className="h-7 w-7 object-cover rounded opacity-75 group-hover:opacity-100 transition-opacity max-w-none"
                src={currentOrg?.logo}
              />
            )}
            <h1
              className={`text-white ${
                currentOrg.logo ? "hidden sm:block" : "block"
              } font-medium`}
            >
              {currentOrg.name}
            </h1>
          </a>
        </Link>
      ) : (
        <h1 className="text-white block font-medium">Plato</h1>
      )}

      {event && (
        <>
          <ChevronArrowRightIcon className={`w-4 h-4 text-white opacity-50`} />

          <div className="group flex items-center">
            <Link href="/[event]" as={`/${event.slug}`}>
              <a
                className={`hover:bg-${color}-dark px-2 py-1 text-white rounded-md mx-0 font-medium`}
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
                <ChevronArrowRightIcon
                  className={`w-4 h-4 text-white opacity-50`}
                />
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
          </div>
        </>
      )}
    </div>
  );
};

export default OrganizationAndEventHeader;
