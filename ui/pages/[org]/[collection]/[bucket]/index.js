import { useQuery, gql } from "urql";
import Head from "next/head";

import Dream from "../../../../components/Dream";
import HappySpinner from "../../../../components/HappySpinner";
import SubMenu from "../../../../components/SubMenu";
import PageHero from "../../../../components/PageHero";
import Sidebar from "../../../../components/Dream/Sidebar";
import { isMemberOfDream } from "utils/helpers";
import Overview from "../../../../components/Dream/Overview";

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

  return (
    <>
      <Overview
        router={router}
        currentUser={currentUser}
        currentOrg={currentOrg}
        collection={collection}
      />

      <SubMenu bucket={bucket} />

      <Dream
        dream={bucket}
        collection={collection}
        currentUser={currentUser}
        currentOrg={currentOrg}
      />
    </>
  );
};

export default DreamPage;
