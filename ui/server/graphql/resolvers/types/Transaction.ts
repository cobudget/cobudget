export const __resolveType = (transaction) => {
  if (transaction.bucketId) {
    return "Contribution";
  }
  return "Allocation"; // GraphQLError is thrown
};
