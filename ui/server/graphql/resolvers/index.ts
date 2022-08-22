import GraphQLJSON from "graphql-type-json";
import { GraphQLJSONObject } from "graphql-type-json";
import { getLanguageProgress as languageProgressPage } from "./helpers";

// queries
import {
  groupQueries,
  userQueries,
  roundQueries,
  bucketQueries,
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
} from "./types";

// mutations
import {
  userMutations,
  groupMutations,
  roundMutations,
  bucketMutations,
} from "./mutations";

const resolvers = {
  Query: {
    ...userQueries,
    ...groupQueries,
    ...roundQueries,
    ...bucketQueries,
    languageProgressPage,
  },

  Mutation: {
    ...userMutations,
    ...groupMutations,
    ...roundMutations,
    ...bucketMutations,
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
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  CustomFieldValue,
};

export default resolvers;
