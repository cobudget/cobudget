import Head from "next/head";
import Sidebar from "./Sidebar";
import BucketGallery from "./BucketGallery";
import HappySpinner from "components/HappySpinner";
import { isMemberOfBucket } from "utils/helpers";
import Title from "./Title";
import Summary from "./Summary";
import { FormattedMessage } from "react-intl";
import { COCREATORS_CANT_EDIT } from "utils/messages";
import toast from "react-hot-toast";

export default function Overview({
  currentUser,
  currentGroup,
  fetching,
  error,
  bucket,
  openImageModal,
  showBucketReview,
}) {
  if (!bucket) return null;
  const canEdit =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator ||
    isMemberOfBucket(currentUser, bucket);

  const cocreatorsEditableStatuses = [
    "PENDING_APPROVAL",
    "IDEA",
    "FUNDED",
    "COMPLETED",
  ];

  const isEditingAllowed =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator ||
    (isMemberOfBucket(currentUser, bucket) &&
      (bucket.round.canCocreatorEditOpenBuckets
        ? true
        : cocreatorsEditableStatuses.indexOf(bucket.status) > -1));

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
        <h1 className="text-2xl">
          <FormattedMessage defaultMessage="Can't find this bucket..." />
        </h1>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {bucket.title} | {bucket.round?.title}
        </title>
      </Head>
      <div className="border-b border-b-default">
        <div className="max-w-screen-xl mx-auto py-14 px-2 md:px-4">
          <Title
            title={bucket.title}
            bucketId={bucket.id}
            canEdit={canEdit}
            isEditingAllowed={isEditingAllowed}
          />
          <Summary
            bucketId={bucket.id}
            summary={bucket.summary}
            canEdit={canEdit}
            isEditingAllowed={isEditingAllowed}
          />

          <div className="grid grid-cols-1 md:grid-cols-sidebar gap-6 items-start">
            <BucketGallery
              images={bucket.images}
              canEdit={canEdit}
              openImageModal={() => {
                if (isEditingAllowed) {
                  openImageModal();
                } else {
                  toast.error(COCREATORS_CANT_EDIT);
                }
              }}
            />
            <div className="md:sticky md:top-4 md:self-start">
              <Sidebar
                bucket={bucket}
                currentUser={currentUser}
                currentGroup={currentGroup}
                canEdit={canEdit}
                showBucketReview={showBucketReview}
                isAdminOrModerator={
                  currentUser?.currentCollMember?.isAdmin ||
                  currentUser?.currentCollMember?.isModerator
                }
                isCocreator={isMemberOfBucket(currentUser, bucket)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
