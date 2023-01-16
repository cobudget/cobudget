import { isMemberOfBucket } from "utils/helpers";

import Images from "./Images";
import Budget from "./Budget";
import Description from "./Description";
import BucketCustomFields from "./CustomFields/BucketCustomFields";
import DirectFunding from "./DirectFunding";
import { useEffect } from "react";
import { useRouter } from "next/router";
import getQueryParam from "../../utils/getQueryParam";
import toast from "react-hot-toast";

const Bucket = ({ bucket, currentUser, openImageModal }) => {
  const router = useRouter();

  const canEdit =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator ||
    isMemberOfBucket(currentUser, bucket);

  useEffect(() => {
    const paramKey = "fund_success";
    const param = getQueryParam(router.query, paramKey);
    if (param && !isNaN(Number(param))) {
      toast.success(
        `You contributed ${Number(param) / 100} ${
          bucket.round.currency
        } to this ${process.env.BUCKET_NAME_SINGULAR}!`
      );
      const query = router.query;
      delete query[paramKey];
      router.push({
        pathname: router.pathname,
        query,
      });
    }
  }, [router, bucket.round?.currency]);

  if (!bucket) return null;

  return (
    <div className="bg-white border-b-default">
      <div className="page relative">
        <div className="grid grid-cols-1 md:grid-cols-sidebar gap-10">
          <div className="py-2">
            <Images
              images={bucket.images}
              size={100}
              canEdit={canEdit}
              bucketId={bucket.id}
              openImageModal={openImageModal}
            />

            {bucket.description && (
              <Description
                // We no longer use this field for new buckets.
                // Eventually we will migrate all current descriptions to custom fields.
                description={bucket.description}
                bucketId={bucket.id}
                canEdit={canEdit}
              />
            )}

            <BucketCustomFields
              roundId={bucket.round.id}
              bucketId={bucket.id}
              customFields={bucket.customFields}
              canEdit={canEdit}
            />

            <Budget
              bucket={bucket}
              canEdit={canEdit}
              currency={bucket.round.currency}
              allowStretchGoals={bucket.round.allowStretchGoals}
              minGoal={bucket.minGoal}
              maxGoal={bucket.maxGoal}
            />

            <DirectFunding canEdit={canEdit} round={bucket.round} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bucket;
