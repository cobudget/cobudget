import { dedupExchange, fetchExchange, errorExchange } from "urql";
import { NextUrqlContext, NextUrqlPageContext, SSRExchange } from "next-urql";
import { devtoolsExchange } from "@urql/devtools";
import { cacheExchange } from "@urql/exchange-graphcache";
import { simplePagination } from "@urql/exchange-graphcache/extras";

import { ORG_MEMBERS_QUERY } from "../components/Org/OrgMembers/OrgMembersTable";
import { EVENT_MEMBERS_QUERY } from "../components/EventMembers";
import { COMMENTS_QUERY, DELETE_COMMENT_MUTATION } from "../contexts/comment";

export const getUrl = (): string => {
  if (process.browser) return `/api`;

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
        },
        // resolvers: {
        //   Query: {
        //     dreamsPage: simplePagination({
        //       // offsetArgument: "offset",
        //       // limitArgument: "limit",
        //       // mergeMode: "after",
        //     }),
        //   },
        // },
        updates: {
          Mutation: {
            addComment(result: any, { content, dreamId }, cache) {
              console.log({ result });
              if (result.addComment) {
                cache.updateQuery(
                  {
                    query: COMMENTS_QUERY,
                    variables: {
                      dreamId,
                      from: 0,
                      limit: 10,
                      order: "desc",
                    },
                  },
                  (data) => {
                    console.log({ data });
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
            deleteComment(result: any, { commentId, dreamId }, cache) {
              console.log({ result });
              if (result.deleteComment) {
                cache.updateQuery(
                  {
                    query: COMMENTS_QUERY,
                    variables: {
                      dreamId,
                      from: 0,
                      limit: 10,
                      order: "desc",
                    },
                  },
                  (data) => {
                    console.log({ data });
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
            inviteEventMembers(result: any, { eventId }, cache) {
              if (result.inviteEventMembers) {
                cache.updateQuery(
                  {
                    query: EVENT_MEMBERS_QUERY,
                    variables: { eventId, offset: 0, limit: 1000 },
                  },
                  (data: any) => {
                    console.log({
                      data,
                    });
                    return {
                      ...data,
                      approvedMembersPage: {
                        ...data.approvedMembersPage,
                        approvedMembers: [
                          ...result.inviteEventMembers,
                          ...data.approvedMembersPage?.approvedMembers,
                        ],
                      },
                    };
                  }
                );
              }
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
