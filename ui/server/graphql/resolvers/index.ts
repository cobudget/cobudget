import GraphQLJSON, { GraphQLJSONObject } from "graphql-type-json";
import { getLanguageProgress as languageProgressPage } from "./helpers";

// queries
import {
  bucketQueries,
  budgetItemQueries,
  expensesQueries,
  groupQueries,
  randomRoundImages,
  roundQueries,
  superAdminQueries,
  userQueries,
} from "./queries";

import {
  Bucket,
  Comment,
  Contribution,
  CustomFieldValue,
  Date,
  Expense,
  Flag,
  Group,
  GroupMember,
  InvitedMember,
  Round,
  RoundMember,
  RoundTransaction,
  SuperAdminSession,
  Transaction,
  User,
} from "./types";

// mutations
import {
  bucketMutations,
  groupMutations,
  roundMutations,
  superAdminMutations,
  userMutations,
} from "./mutations";

import { BigInt } from "./types/Scalars";

const resolvers = {
  Query: {
    ...userQueries,
    ...groupQueries,
    ...roundQueries,
    ...bucketQueries,
    ...budgetItemQueries,
    ...superAdminQueries,
    ...expensesQueries,
    randomRoundImages,
    languageProgressPage,
  },

  Mutation: {
    ...userMutations,
    ...groupMutations,
    ...roundMutations,
    ...bucketMutations,
    ...superAdminMutations,
  },

  RoundMember,
  InvitedMember,
  GroupMember,
  User,
  Group,
  Round,
  Bucket,
  Transaction,
  Contribution,
  RoundTransaction,
  Comment,
  Flag,
  Date,
  Expense,
  SuperAdminSession,
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  BigInt,
  CustomFieldValue,
};

export default resolvers;
