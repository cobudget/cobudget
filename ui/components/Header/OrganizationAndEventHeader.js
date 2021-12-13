import Link from "next/link";
import { useQuery, gql } from "urql";
import { ChevronArrowRightIcon } from "components/Icons";

const BUCKET_QUERY = gql`
  query Bucket($id: ID!) {
    bucket(id: $id) {
      id
      title
    }
  }
`;

const OrganizationAndEventHeader = ({
  currentOrg,
  collection,
  router,
  color,
}) => {
  const [{ data: { bucket } = { bucket: null } }] = useQuery({
    query: BUCKET_QUERY,
    variables: { id: router.query.bucket },
    pause: !router.query.bucket,
  });

  return (
    <div className="space-x-1 flex items-center">
      <Link href="/">
        <a
          className={`hover:bg-${color}-dark px-1 py-1 text-white rounded-md font-medium flex space-x-4`}
        >
          <img src="/cobudget-logo.png" className="h-6 max-w-none" />
          {!currentOrg && !collection && <h1>Cobudget</h1>}
        </a>
      </Link>
      {currentOrg && (
        <>
          <ChevronArrowRightIcon className={`w-4 h-4 text-white opacity-50`} />

          <Link href={`/${currentOrg.slug}`}>
            <a
              className={
                "px-2 py-1 rounded-md flex items-center group space-x-2 " +
                `text-white hover:bg-${color}-dark`
              }
            >
              {currentOrg.logo && (
                <img
                  className="h-6 w-6 object-cover rounded opacity-75 group-hover:opacity-100 transition-opacity max-w-none"
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
        </>
      )}

      {collection && (
        <>
          <ChevronArrowRightIcon className={`w-4 h-4 text-white opacity-50`} />

          <div className="group flex items-center">
            <Link href={`/${currentOrg?.slug ?? "c"}/${collection.slug}`}>
              <a
                className={`hover:bg-${color}-dark px-2 py-1 text-white rounded-md mx-0 font-medium`}
              >
                <h1>
                  {collection.title.length <= 30
                    ? collection.title
                    : collection.title.substr(0, 30) + "..."}
                </h1>
              </a>
            </Link>

            {/* We need to check both the dream and the router to prevent caching to appear */}
            {bucket && router.query?.bucket && (
              <>
                <ChevronArrowRightIcon
                  className={`w-4 h-4 text-white opacity-50`}
                />
                <span
                  className={"px-2 py-1 text-white rounded-md mx-0 font-medium"}
                >
                  <h1>
                    {bucket.title.length <= 30
                      ? bucket.title
                      : bucket.title.substr(0, 30) + "..."}
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
