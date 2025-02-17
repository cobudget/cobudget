import { gql } from "urql";

export const DELETE_BUCKET_MUTATION = gql`
  mutation DeleteBucket($bucketId: ID!) {
    deleteBucket(bucketId: $bucketId) {
      id
    }
  }
`;

export const updateDeleteBucket = (bucketId: string) => (data: any) => {
  if (data == null || data.bucketsPage == null) {
    return data;
  }
  if (!Array.isArray(data.bucketsPage.buckets)) {
    return data;
  }
  data.bucketsPage.buckets = data.bucketsPage.buckets.filter(
    (bucket: any) => bucket.id !== bucketId
  );
  return data;
};
