import {
  dedupExchange,
  fetchExchange,
  errorExchange,
  gql,
  RequestPolicy,
  Exchange,
} from "urql";
import { NextUrqlContext, NextUrqlPageContext, SSRExchange } from "next-urql";
import { devtoolsExchange } from "@urql/devtools";
import { cacheExchange } from "@urql/exchange-graphcache";

import { GROUP_MEMBERS_QUERY } from "../components/Group/GroupMembers/GroupMembersTable";
import { ROUND_MEMBERS_QUERY } from "../components/RoundMembers";
import { COMMENTS_QUERY, DELETE_COMMENT_MUTATION } from "../contexts/comment";
import { BUCKETS_QUERY } from "pages/[group]/[round]";
import { BUCKET_QUERY } from "pages/[group]/[round]/[bucket]";
import { GROUP_PAGE_QUERY } from "components/Group";
import { CURRENT_USER_QUERY } from "pages/_app";

export const getUrl = (): string => {
  if (typeof window !== "undefined") return `/api`;

  if (process.env.NODE_ENV === `development`)
    return `http://localhost:3000/api`;

  if (process.env.DEPLOY_URL) {
    return `https://${process.env.DEPLOY_URL}/api`;
  }

  return `https://${process.env.VERCEL_URL}/api`;
};

export const client = (
  ssrExchange: SSRExchange
  //ctx: NextUrqlContext | undefined
): { url: string; exchanges: Exchange[] } => {
  return {
    url: getUrl(),
    // requestPolicy: "cache-and-network",
    exchanges: [
      // errorExchange({
      //   // onError: (error) => {
      //   //   throw new Error(error.message);
      //   //   console.error(error.message.replace("[GraphQL]", "Server error:"));
      //   //   console.error(error);
      //   // },
      // }),
      devtoolsExchange,
      dedupExchange,
      cacheExchange({
        keys: {
          GroupMembersPage: () => null,
          MembersPage: () => null,
          ContributionsPage: () => null,
          CommentSet: () => null,
          BucketsPage: () => null,
          BucketStatusCount: () => null,
        },
        updates: {
          Mutation: {
            allocate(result: any, args, cache) {
              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "roundTransactions")
                .forEach((field) => {
                  cache.invalidate(
                    "Query",
                    "roundTransactions",
                    field.arguments
                  );
                });
            },
            joinRound(result: any, args, cache) {
              if (result.joinRound) {
                console.log({ result });
                cache.updateQuery(
                  {
                    query: CURRENT_USER_QUERY,
                    variables: {
                      groupSlug: result.joinRound.round.group?.slug ?? "c",
                      roundSlug: result.joinRound.round.slug,
                    },
                  },
                  (data: any) => {
                    console.log({ data });
                    return {
                      ...data,
                      currentUser: {
                        ...data.currentUser,
                        currentCollMember: result.joinRound,
                        roundMemberships: [
                          ...data.currentUser.roundMemberships,
                          result.joinRound,
                        ],
                      },
                    };
                  }
                );
              }
            },
            acceptInvitation(result: any, args, cache) {
              if (result?.acceptInvitation?.hasJoined) {
                cache
                  .inspectFields("Query")
                  .filter((field) => field.fieldName === "membersPage")
                  .forEach((field) => {
                    cache.invalidate("Query", "membersPage", field.arguments);
                  });
              }
            },
            joinGroup(result: any, args, cache) {
              if (result.joinGroup) {
                cache.updateQuery(
                  {
                    query: CURRENT_USER_QUERY,
                    variables: {
                      groupSlug: result.joinGroup.group.slug,
                      roundSlug: undefined,
                    },
                  },
                  (data: any) => {
                    return {
                      ...data,
                      currentUser: {
                        ...data.currentUser,
                        currentGroupMember: result.joinGroup,
                      },
                    };
                  }
                );
              }
            },
            deleteGroupMember(result: any, { groupMemberId }, cache) {
              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "orgMembersPage")
                .forEach((field) => {
                  cache.invalidate("Query", "orgMembersPage", field.arguments);
                });
            },
            updateMember(result: any, { isApproved }, cache) {
              // only invalidate if isApproved, this means we move a member from the request list to the approvedMembers list
              if (isApproved)
                cache
                  .inspectFields("Query")
                  .filter((field) => field.fieldName === "membersPage")
                  .forEach((field) => {
                    cache.invalidate("Query", "membersPage", field.arguments);
                  });
            },

            deleteMember(result: any, { memberId }, cache) {
              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "membersPage")
                .forEach((field) => {
                  cache.invalidate("Query", "membersPage", field.arguments);
                });

              // cache
              //   .inspectFields("Query")
              //   .filter((field) => field.fieldName === "membersPage")
              //   .forEach((field) => {
              //     if (!field.arguments.limit) return null;
              //     cache.updateQuery(
              //       {
              //         query: ROUND_MEMBERS_QUERY,
              //         variables: {
              //           roundId: field.arguments.roundId,
              //           offset: field.arguments.offset,
              //           limit: field.arguments.limit,
              //         },
              //       },
              //       (data) => {
              //         return {
              //           ...data,
              //           approvedMembersPage: {
              //             ...data.approvedMembersPage,
              //             approvedMembers: data.approvedMembersPage.approvedMembers.filter(
              //               (member) => member.id !== memberId
              //             ),
              //           },
              //           requestsToJoinPage: {
              //             ...data.requestsToJoinPage,
              //             requestsToJoin: data.requestsToJoinPage.requestsToJoin.filter(
              //               (member) => member.id !== memberId
              //             ),
              //           },
              //         };
              //       }
              //     );
              //   });
            },
            createRound(result: any, args, cache) {
              const fields = cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "rounds")
                .forEach((field) => {
                  cache.invalidate("Query", "rounds", field.arguments);
                });
            },
            deleteRound(result: any, { roundId }, cache) {
              const fields = cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "rounds")
                .forEach((field) => {
                  cache.updateQuery(
                    {
                      query: GROUP_PAGE_QUERY,
                      variables: {
                        groupSlug: field.arguments.groupSlug,
                      },
                    },
                    (data: any) => {
                      data.rounds = data.rounds.filter(
                        (round) => round.id !== roundId
                      );
                      return data;
                    }
                  );
                });
            },
            deleteTag(result: any, { tagId }, cache) {
              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "bucket")
                .forEach((field) => {
                  cache.updateQuery(
                    {
                      query: BUCKET_QUERY,
                      variables: field.arguments,
                    },
                    (data: any) => {
                      data.bucket.tags = data.bucket.tags.filter(
                        (tag) => tag.id !== tagId
                      );
                      return data;
                    }
                  );
                });
            },
            createBucket(result: any, args, cache) {
              // normally when adding a thing to a cached list we just want
              // to prepend the new item. but the bucket list on the coll
              // page has a weird shuffle, so we'll instead invalidate the
              // cache so that the list is refetched next time

              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "bucketsPage")
                .filter(
                  (field) =>
                    field.arguments.roundSlug === result.createBucket.round.slug
                )
                .forEach((field) => {
                  cache.invalidate("Query", "bucketsPage", field.arguments);
                });
            },
            deleteBucket(result: any, { bucketId }, cache) {
              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "bucketsPage")
                .forEach((field) => {
                  cache.updateQuery(
                    {
                      query: BUCKETS_QUERY,
                      variables: field.arguments,
                    },
                    (data: any) => {
                      data.bucketsPage.buckets = data.bucketsPage.buckets.filter(
                        (bucket) => bucket.id !== bucketId
                      );
                      return data;
                    }
                  );
                });
            },
            addComment(result: any, { content, bucketId }, cache) {
              if (result.addComment) {
                cache.updateQuery(
                  {
                    query: COMMENTS_QUERY,
                    variables: {
                      bucketId,
                      from: 0,
                      limit: 10,
                      order: "desc",
                    },
                  },
                  (data: any) => {
                    return {
                      ...data,
                      commentSet: {
                        ...data?.commentSet,
                        comments: data?.commentSet?.comments.concat(
                          result.addComment
                        ),
                      },
                    };
                  }
                );
              }
            },
            deleteComment(result: any, { commentId, bucketId }, cache) {
              if (result.deleteComment) {
                cache.updateQuery(
                  {
                    query: COMMENTS_QUERY,
                    variables: {
                      bucketId,
                      from: 0,
                      limit: 10,
                      order: "desc",
                    },
                  },
                  (data: any) => {
                    return {
                      ...data,
                      commentSet: {
                        ...data?.commentSet,
                        comments: data?.commentSet?.comments.filter(
                          ({ id }) => id !== commentId
                        ),
                      },
                    };
                  }
                );
              }
            },
            raiseFlag(result, { bucketId }, cache) {
              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "commentSet")
                .filter((field) => field.arguments.bucketId === bucketId)
                .forEach((field) => {
                  cache.invalidate("Query", "commentSet", field.arguments);
                });
            },
            resolveFlag(result, { bucketId }, cache) {
              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "commentSet")
                .filter((field) => field.arguments.bucketId === bucketId)
                .forEach((field) => {
                  cache.invalidate("Query", "commentSet", field.arguments);
                });
            },
            inviteGroupMembers(result: any, _args, cache) {
              if (result.inviteGroupMembers) {
                cache.updateQuery(
                  {
                    query: GROUP_MEMBERS_QUERY,
                    variables: { offset: 0, limit: 30 },
                  },
                  (data: any) => {
                    return {
                      ...data,
                      groupMembersPage: {
                        ...data.groupMembersPage,
                        groupMembers: [
                          ...result.inviteGroupMembers,
                          ...data.groupMembersPage.groupMembers,
                        ],
                      },
                    };
                  }
                );
              }
            },
            inviteRoundMembers(result: any, { roundId }, cache) {
              if (result.inviteRoundMembers) {
                cache.updateQuery(
                  {
                    query: ROUND_MEMBERS_QUERY,
                    variables: { roundId, offset: 0, limit: 1000, search: "" },
                  },
                  (data: any) => {
                    const existingEmails =
                      data.approvedMembersPage?.approvedMembers?.map(
                        (member) => member.email
                      ) || [];
                    const newInvitedMembers = result.inviteRoundMembers?.filter(
                      (member) => existingEmails.indexOf(member.email) === -1
                    );

                    if (newInvitedMembers.length === 0) {
                      return;
                    }

                    return {
                      ...data,
                      approvedMembersPage: {
                        ...data.approvedMembersPage,
                        approvedMembers: [
                          ...newInvitedMembers,
                          ...data.approvedMembersPage?.approvedMembers,
                        ],
                      },
                    };
                  }
                );
              }
            },
            contribute(result, args, cache) {
              const queryFields = cache.inspectFields("Query");

              queryFields
                .filter((field) => field.fieldName === "roundTransactions")
                .forEach((field) => {
                  cache.invalidate(
                    "Query",
                    "roundTransactions",
                    field.arguments
                  );
                });

              queryFields
                .filter((field) => field.fieldName === "contributionsPage")
                .forEach((field) => {
                  cache.invalidate(
                    "Query",
                    "contributionsPage",
                    field.arguments
                  );
                });

              queryFields
                .filter((field) => field.fieldName === "membersPage")
                .forEach((field) => {
                  cache.invalidate("Query", "membersPage", field.arguments);
                });

              queryFields
                .filter((field) => field.fieldName === "round")
                .forEach((field) => {
                  cache.invalidate("Query", "round", field.arguments);
                });
            },
          },
        },
      }),
      ssrExchange,
      fetchExchange,
    ],
  };
};
