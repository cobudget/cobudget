import { useQuery, gql } from "urql";
import Head from "next/head";

import Dream from "../../../../components/Dream";
import HappySpinner from "../../../../components/HappySpinner";

export const BUCKET_QUERY = gql`
  query Bucket($id: ID!) {
    bucket(id: $id) {
      id
      description
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
      noOfContributions
      latestContributions {
        id
        amount
        createdAt

        collectionMember {
          id

          user {
            id
            name
            username
          }
        }
      }
      tags {
        id
        value
      }
      raisedFlags {
        id
        comment
        guideline {
          id
          title
        }
      }
      customFields {
        id
        value
        customField {
          id
          name
          type
          limit
          description
          isRequired
          position
          createdAt
        }
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
      discourseTopicUrl

      budgetItems {
        id
        description
        min
        max
        type
      }
    }
  }
`;

const DreamPage = ({ collection, currentUser, currentOrg, router }) => {
  const [{ data, fetching: loading, error }] = useQuery({
    query: BUCKET_QUERY,
    variables: { id: router.query.bucket },
  });

  const { bucket } = data ?? { bucket: null };

  if (bucket)
    return (
      <div className="page">
        <Head>
          <title>
            {bucket.title} | {collection?.title}
          </title>
        </Head>
        <Dream
          dream={bucket}
          collection={collection}
          currentUser={currentUser}
          currentOrg={currentOrg}
        />
      </div>
    );

  if (loading)
    return (
      <div className="flex-grow flex justify-center items-center h-64">
        <HappySpinner />
      </div>
    );

  if (error) {
    console.error(error);
    return (
      <div className="flex-grow flex justify-center items-center">
        {error.message}
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col justify-center items-center">
      <span className="text-4xl">404</span>
      <h1 className="text-2xl">Can&apos;t find this bucket...</h1>
    </div>
  );
};

export default DreamPage;
