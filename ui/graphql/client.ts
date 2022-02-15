import { dedupExchange, fetchExchange, errorExchange, gql } from "urql";
import { NextUrqlContext, NextUrqlPageContext, SSRExchange } from "next-urql";
import { devtoolsExchange } from "@urql/devtools";
import { cacheExchange } from "@urql/exchange-graphcache";
import { simplePagination } from "@urql/exchange-graphcache/extras";

import { ORG_MEMBERS_QUERY } from "../components/Org/OrgMembers/OrgMembersTable";
import { COLLECTION_MEMBERS_QUERY } from "../components/EventMembers";
import { COMMENTS_QUERY, DELETE_COMMENT_MUTATION } from "../contexts/comment";
import { BUCKETS_QUERY } from "pages/[org]/[collection]";
import { BUCKET_QUERY } from "pages/[org]/[collection]/[bucket]";
import { COLLECTIONS_QUERY } from "pages/[org]";
import { TOP_LEVEL_QUERY } from "pages/_app";

export const getUrl = (): string => {
  if (typeof window !== "undefined") return `/api`;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }

  if (process.env.NODE_ENV === `development`)
    return `http://localhost:3000/api`;

  return "https://cobudget.com/api";
};

export const client = (
  ssrExchange: SSRExchange,
  ctx: NextUrqlContext | undefined
) => {
  return {
    url: getUrl(),
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
          OrgMembersPage: () => null,
          MembersPage: () => null,
          ContributionsPage: () => null,
          CommentSet: () => null,
          BucketsPage: () => null,
        },
        updates: {
          Mutation: {
            allocate(result: any, args, cache) {
              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "collectionTransactions")
                .forEach((field) => {
                  cache.invalidate("Query", "collectionTransactions", field.arguments);
                });
            },
            joinCollection(result: any, args, cache) {
              if (result.joinCollection) {
                console.log({ result });
                cache.updateQuery(
                  {
                    query: TOP_LEVEL_QUERY,
                    variables: {
                      orgSlug:
                        result.joinCollection.collection.organization?.slug ??
                        "c",
                      collectionSlug: result.joinCollection.collection.slug,
                    },
                  },
                  (data) => {
                    console.log({ data });
                    return {
                      ...data,
                      currentUser: {
                        ...data.currentUser,
                        currentCollMember: result.joinCollection,
                        collectionMemberships: [
                          ...data.currentUser.collectionMemberships,
                          result.joinCollection,
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
            joinOrg(result: any, args, cache) {
              if (result.joinOrg) {
                cache.updateQuery(
                  {
                    query: TOP_LEVEL_QUERY,
                    variables: {
                      orgSlug: result.joinOrg.organization.slug,
                      collectionSlug: undefined,
                    },
                  },
                  (data) => {
                    return {
                      ...data,
                      currentOrgMember: result.joinOrg,
                    };
                  }
                );
              }
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
              //         query: COLLECTION_MEMBERS_QUERY,
              //         variables: {
              //           collectionId: field.arguments.collectionId,
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
            deleteCollection(result: any, { collectionId }, cache) {
              const fields = cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "collections")
                .forEach((field) => {
                  cache.updateQuery(
                    {
                      query: COLLECTIONS_QUERY,
                      variables: {
                        orgSlug: field.arguments.orgSlug,
                      },
                    },
                    (data) => {
                      data.collections = data.collections.filter(
                        (collection) => collection.id !== collectionId
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
                    (data) => {
                      data.bucket.tags = data.bucket.tags.filter(
                        (tag) => tag.id !== tagId
                      );
                      return data;
                    }
                  );
                });
            },
            createDream(result: any, { collectionId }, cache) {
              // normally when adding a thing to a cached list we just want
              // to prepend the new item. but the bucket list on the coll
              // page has a weird shuffle, so we'll instead invalidate the
              // cache so that the list is refetched next time

              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "bucketsPage")
                .filter(
                  (field) => field.arguments.collectionId === collectionId
                )
                .forEach((field) => {
                  cache.invalidate("Query", "bucketsPage", field.arguments);
                });
            },
            deleteDream(result: any, { bucketId }, cache) {
              cache
                .inspectFields("Query")
                .filter((field) => field.fieldName === "bucketsPage")
                .forEach((field) => {
                  cache.updateQuery(
                    {
                      query: BUCKETS_QUERY,
                      variables: field.arguments,
                    },
                    (data) => {
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
                  (data) => {
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
                  (data) => {
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
            inviteOrgMembers(result: any, _args, cache) {
              if (result.inviteOrgMembers) {
                cache.updateQuery(
                  {
                    query: ORG_MEMBERS_QUERY,
                    variables: { offset: 0, limit: 30 },
                  },
                  (data: any) => {
                    return {
                      ...data,
                      orgMembersPage: {
                        ...data.orgMembersPage,
                        orgMembers: [
                          ...result.inviteOrgMembers,
                          ...data.orgMembersPage.orgMembers,
                        ],
                      },
                    };
                  }
                );
              }
            },
            inviteCollectionMembers(result: any, { collectionId }, cache) {
              if (result.inviteCollectionMembers) {
                cache.updateQuery(
                  {
                    query: COLLECTION_MEMBERS_QUERY,
                    variables: { collectionId, offset: 0, limit: 1000 },
                  },
                  (data: any) => {
                    const existingEmails =
                      data.approvedMembersPage?.approvedMembers?.map(
                        (member) => member.email
                      ) || [];
                    const newInvitedMembers = result.inviteCollectionMembers?.filter(
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
                  .filter((field) => field.fieldName === "collectionTransactions")
                  .forEach((field) => {
                    cache.invalidate("Query", "collectionTransactions", field.arguments);
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
            },
          },
        },
      }),
      ssrExchange,
      fetchExchange,
    ],
    fetchOptions: {
      headers: {
        //@ts-ignore
        ...ctx?.req?.headers,
      },
      credentials: "include",
    },
  };
};
