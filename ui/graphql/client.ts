import { dedupExchange, fetchExchange } from "urql";
import { NextUrqlContext, SSRExchange } from "next-urql";
import { devtoolsExchange } from "@urql/devtools";
import { cacheExchange } from "@urql/exchange-graphcache";

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
      devtoolsExchange,
      dedupExchange,
      cacheExchange({}),
      ssrExchange,
      fetchExchange,
    ],
    fetchOptions: {
      headers: {
        ...ctx?.req?.headers,
      },
      credentials: "include",
    },
  };
};
