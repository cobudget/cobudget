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
  if (!Array.isArray(data.bucketsPage.buckets)) {
    return data;
  }
  return {
    ...data,
    bucketsPage: {
      ...data.bucketsPage,
      buckets: data.bucketsPage.buckets.filter(
        (bucket: any) => bucket?.id !== bucketId
      ),
    },
  };
};
