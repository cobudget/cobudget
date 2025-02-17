import { gql } from "urql";

export const DELETE_BUCKET_MUTATION = gql`
  mutation DeleteBucket($bucketId: ID!) {
    deleteBucket(bucketId: $bucketId) {
      id
    }
  }
`;

export const updateDeleteBucket = (bucketId: string) => (data: any) => {
  if (!data || !data.bucketsPage || !data.bucketsPage.buckets) {
    return data;
  }
  data.bucketsPage.buckets = data.bucketsPage.buckets.filter(
    (bucket: any) => bucket.id !== bucketId
  );
  return data;
};
