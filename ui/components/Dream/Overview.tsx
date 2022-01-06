import Head from "next/head";
import { useQuery, gql } from "urql";

import Sidebar from "./Sidebar";
import HappySpinner from "components/HappySpinner";
import { isMemberOfDream } from "utils/helpers";
import { stringToColor } from "utils/stringToHslColor";
export const BUCKET_QUERY = gql`
  query Bucket($id: ID!) {
    bucket(id: $id) {
      id
      summary
      title
      minGoal
      maxGoal
      income
      totalContributions
      totalContributionsFromCurrentMember
      approved
      published
      completed
      completedAt
      funded
      fundedAt
      canceled
      canceledAt
      tags {
        id
        value
      }
      cocreators {
        id
        user {
          id
          username
          avatar
        }
      }
      images {
        id
        small
        large
      }
    }
  }
`;

export default function Overview({
  collection,
  currentUser,
  currentOrg,
  router,
}) {
  const [{ data, fetching, error }] = useQuery({
    query: BUCKET_QUERY,
    variables: { id: router.query.bucket },
  });
  const { bucket } = data ?? { bucket: null };

  const canEdit =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator ||
    isMemberOfDream(currentUser, bucket);

  if (fetching && !bucket) {
    return (
      <div className="flex-grow flex justify-center items-center h-64">
        <HappySpinner />
      </div>
    );
  }

  if (error) {
    console.error(error);
    return (
      <div className="flex-grow flex justify-center items-center">
        {error.message}
      </div>
    );
  }

  if (!bucket) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center">
        <span className="text-4xl">404</span>
        <h1 className="text-2xl">Can&apos;t find this bucket...</h1>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {bucket.title} | {collection?.title}
        </title>
      </Head>
      <div className="border-b border-b-default">
        <div className="max-w-screen-xl mx-auto py-14 px-2 md:px-4">
          <h1 className="text-3xl font-medium mb-1 text-center">
            {bucket.title}
          </h1>
          <p className="text-lg mb-8 text-center text-gray-800">
            {bucket.summary}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-sidebar gap-10">
            {/* <img src={bucket.images[0].large} className="" /> */}
            {bucket.images.length > 0 ? (
              <img
                className="h-64 md:h-88 w-full object-cover object-center"
                src={bucket.images[0].large ?? bucket.images[0].small}
              />
            ) : (
              <div
                className={`h-64 md:h-88 w-full bg-${stringToColor(
                  bucket.title
                )}`}
              />
            )}
            <div className="">
              <Sidebar
                dream={bucket}
                collection={collection}
                currentUser={currentUser}
                canEdit={canEdit}
                currentOrg={currentOrg}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

{
  /* <Title title={dream.title} bucketId={dream.id} canEdit={canEdit} />
<Summary
  bucketId={dream.id}
  summary={dream.summary}
  canEdit={canEdit}
/> */
}
