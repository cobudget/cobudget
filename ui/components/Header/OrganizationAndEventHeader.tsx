import Link from "next/link";
import { useQuery, gql } from "urql";

import { SlashIcon } from "../Icons";
import Selector from "./Selector";

const BUCKET_QUERY = gql`
  query Bucket($id: ID!) {
    bucket(id: $id) {
      id
      title
    }
  }
`;

//const capLength = (title: string) =>
//              title <= 30
//                ? title
//                : title.substr(0, 30) + "..."}

const OrganizationAndEventHeader = ({
  currentOrg,
  collection,
  currentUser,
  router,
  color,
}) => {
  const [{ data }] = useQuery({
    query: BUCKET_QUERY,
    variables: { id: router.query.bucket },
    pause: !router.query.bucket,
  });

  const { bucket } = data ?? { bucket: null };

  return (
    <div className="flex items-center max-w-screen overflow-hidden">
      <Link href="/">
        <a className={`p-1 text-white rounded-md font-medium flex space-x-4`}>
          <img src="/cobudget-logo.png" className="h-6 max-w-none" />
          {!currentUser && !currentOrg && !collection && <h1>Cobudget</h1>}
        </a>
      </Link>

      {(currentOrg || collection || currentUser) && (
        <>
          <SlashIcon className={`w-7 h-7 text-white opacity-25`} />

          {currentOrg ? (
            <Link href={`/${currentOrg.slug}`}>
              <a
                className={
                  "px-2 py-1 rounded-md flex items-center group space-x-3 text-white truncate"
                }
                style={{ flex: "1 1 25%" }}
              >
                {currentOrg.logo && (
                  <img
                    className="h-6 w-6 object-cover rounded opacity-75 group-hover:opacity-100 transition-opacity max-w-none"
                    src={currentOrg?.logo}
                  />
                )}
                <span className={`text-white font-medium truncate`}>
                  {currentOrg.name}
                </span>
              </a>
            </Link>
          ) : collection ? (
            <Link href={`/c/${collection.slug}`}>
              <a
                className={
                  "flex-shrink px-2 py-1 rounded-md flex items-center group space-x-2 text-white font-medium truncate"
                }
                style={{ flex: "1 1 25%" }}
              >
                {collection.title}
              </a>
            </Link>
          ) : null}
          {currentUser && (
            <Selector
              currentUser={currentUser}
              currentOrg={currentOrg}
              collection={collection}
              color={color}
              className="max-w-none"
            />
          )}
        </>
      )}

      {currentOrg && collection && (
        <>
          <SlashIcon className={`w-7 h-7 text-white opacity-25`} />

          <Link href={`/${currentOrg?.slug ?? "c"}/${collection.slug}`}>
            <a
              className={`px-2 py-1 text-white rounded-md mx-0 font-medium truncate`}
              style={{ flex: "1 1 25%" }}
            >
              {collection.title.length <= 30
                ? collection.title
                : collection.title.substr(0, 30) + "..."}
            </a>
          </Link>
        </>
      )}
      {bucket && router.query?.bucket && (
        <>
          <SlashIcon
            className={`w-7 h-7 text-white opacity-25 hidden sm:block`}
          />

          <span
            className={
              "px-2 py-1 text-white rounded-md mx-0 font-medium truncate hidden sm:block"
            }
          >
            {bucket.title.length <= 30
              ? bucket.title
              : bucket.title.substr(0, 30) + "..."}
          </span>
        </>
      )}
    </div>
  );
};

export default OrganizationAndEventHeader;
