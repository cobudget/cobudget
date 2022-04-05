import { useQuery, gql } from "urql";
import { useState } from "react";
import EditImagesModal from "../../../../components/Bucket/EditImagesModal";
import Bucket from "../../../../components/Bucket";
import Overview from "../../../../components/Bucket/Overview";
import { Tab } from "@headlessui/react";
import Funders from "components/Bucket/Funders";
import Comments from "components/Bucket/Comments";
import Monster from "components/Monster";

import classNames from "utils/classNames";
import HappySpinner from "components/HappySpinner";
import { useRouter } from "next/router";

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
      noOfComments
      noOfFunders
      status
      round {
        id
        slug
        color
        currency
        allowStretchGoals
        bucketReviewIsOpen
        requireBucketApproval
        grantingIsOpen
        grantingHasClosed
        maxAmountToBucketPerUser
        guidelines {
          id
          title
          description
        }
        tags {
          id
          value
        }
        group {
          id
          slug
          discourseUrl
        }
      }
      funders {
        id
        amount
        createdAt
        roundMember {
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
          name
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

const BucketIndex = ({ currentUser }) => {
  const router = useRouter();
  const [{ data, fetching, error }] = useQuery({
    query: BUCKET_QUERY,
    variables: { id: router.query.bucket },
  });
  const [editImagesModalOpen, setEditImagesModalOpen] = useState(false);
  const { bucket } = data ?? { bucket: null };
  const showBucketReview =
    currentUser?.currentCollMember?.isApproved &&
    bucket?.round?.bucketReviewIsOpen &&
    bucket?.round?.guidelines.length > 0 &&
    bucket?.published;

  if (fetching && !bucket) {
    return (
      <div className="flex-grow flex justify-center items-center h-64">
        <HappySpinner />
      </div>
    );
  }

  if (!bucket || !bucket.round)
    return (
      <div className="text-center mt-7">
        This bucket either doesn&apos;t exist or you don&apos;t have access to
        it
      </div>
    );

  return (
    <>
      {/* EditImagesModal is here temporarily to work for both cover image and image thing, eventually we can make cover image its own thing. */}
      <EditImagesModal
        open={editImagesModalOpen}
        initialImages={bucket?.images}
        handleClose={() => setEditImagesModalOpen(false)}
        bucketId={bucket?.id}
      />
      <Overview
        bucket={bucket}
        fetching={fetching}
        error={error}
        currentUser={currentUser}
        showBucketReview={showBucketReview}
        openImageModal={() => setEditImagesModalOpen(true)}
      />

      <Tab.Group>
        <div className="bg-white border-b border-b-default">
          <Tab.List className="space-x-2 max-w-screen-xl mx-auto flex px-2 overflow-x-auto">
            <Tab
              className={({ selected }) =>
                classNames(
                  "block px-2 py-4 border-b-2 font-medium transition-colors",
                  selected
                    ? "border-anthracit text-anthracit"
                    : "border-transparent text-gray-500"
                )
              }
            >
              Bucket
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "block px-2 py-4 border-b-2 font-medium transition-colors",
                  selected
                    ? "border-anthracit text-anthracit"
                    : "border-transparent text-gray-500"
                )
              }
            >
              Comments ({bucket?.noOfComments})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "block px-2 py-4 border-b-2 font-medium transition-colors",
                  selected
                    ? "border-anthracit text-anthracit"
                    : "border-transparent text-gray-500"
                )
              }
            >
              Funders ({bucket?.noOfFunders})
            </Tab>
          </Tab.List>
        </div>

        <Tab.Panels>
          <Tab.Panel>
            <Bucket
              bucket={bucket}
              currentUser={currentUser}
              openImageModal={() => setEditImagesModalOpen(true)}
            />
          </Tab.Panel>
          <Tab.Panel>
            <Comments
              bucket={bucket}
              router={router}
              currentUser={currentUser}
            />
          </Tab.Panel>
          <Tab.Panel>
            <Funders bucket={bucket} currentUser={currentUser} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};

export default BucketIndex;
