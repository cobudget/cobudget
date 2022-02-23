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
      funders {
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

const BucketIndex = ({ collection, currentUser, currentOrg, router }) => {
  const [{ data, fetching, error }] = useQuery({
    query: BUCKET_QUERY,
    variables: { id: router.query.bucket },
  });
  const [editImagesModalOpen, setEditImagesModalOpen] = useState(false);
  const { bucket } = data ?? { bucket: null };
  const showBucketReview =
    currentUser?.currentCollMember?.isApproved &&
    collection.bucketReviewIsOpen &&
    collection.guidelines.length > 0 &&
    bucket?.published;

  if (!bucket || !collection) return null;

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
        currentOrg={currentOrg}
        collection={collection}
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
              collection={collection}
              currentUser={currentUser}
              currentOrg={currentOrg}
              openImageModal={() => setEditImagesModalOpen(true)}
            />
          </Tab.Panel>
          <Tab.Panel>
            <Comments
              bucket={bucket}
              router={router}
              collection={collection}
              currentUser={currentUser}
              currentOrg={currentOrg}
            />
          </Tab.Panel>
          <Tab.Panel>
            <Funders
              bucket={bucket}
              collection={collection}
              currentUser={currentUser}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};

export default BucketIndex;
