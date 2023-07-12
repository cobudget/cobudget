import GraphQLJSON from "graphql-type-json";
import { GraphQLJSONObject } from "graphql-type-json";
import { getLanguageProgress as languageProgressPage } from "./helpers";

// queries
import {
  groupQueries,
  userQueries,
  roundQueries,
  bucketQueries,
  superAdminQueries,
  expensesQueries,
} from "./queries";

import {
  Bucket,
  Comment,
  Contribution,
  CustomFieldValue,
  Flag,
  Group,
  GroupMember,
  InvitedMember,
  Round,
  RoundMember,
  RoundTransaction,
  Transaction,
  User,
  Date,
  SuperAdminSession,
  Expense,
} from "./types";

// mutations
import {
  userMutations,
  groupMutations,
  roundMutations,
  bucketMutations,
  superAdminMutations,
} from "./mutations";

const resolvers = {
  Query: {
    ...userQueries,
    ...groupQueries,
    ...roundQueries,
    ...bucketQueries,
    ...superAdminQueries,
    ...expensesQueries,
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
  CustomFieldValue,
};

export default resolvers;
