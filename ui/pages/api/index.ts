import { ApolloServer } from "apollo-server-micro";
import cors from "cors";
import prisma from "../../server/prisma";
import schema from "../../server/graphql/schema";
import resolvers from "../../server/graphql/resolvers";
import EventHub from "../../server/services/eventHub.service";
import handler from "../../server/api-handler";
import subscribers from "../../server/subscribers";
import cookieParser from "cookie-parser";
import { verify } from "server/utils/jwt";
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";

export const config = {
  api: {
    bodyParser: false,
  },
};

export interface GraphQLContext {
  user?: Express.User;
  prisma: typeof prisma;
  eventHub?: any;
  request?: any;
  response?: any;
  ss?: { id: string };
}

const corsOptions = {
  origin: "*",
  credentials: "include",
};

subscribers.initialize(EventHub);

// ─── Apollo Server ────────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === "production";

const apolloServer = new ApolloServer({
  typeDefs: schema,
  resolvers,
  introspection: !isProd,
  plugins: isProd
    ? [ApolloServerPluginLandingPageDisabled()]
    : [ApolloServerPluginLandingPageGraphQLPlayground()],
  context: async ({ req, res }): Promise<GraphQLContext> => {
    const { user } = req;
    let ss;
    try {
      ss = verify(req.cookies.ss);
    } catch {
      ss = null;
    }
    return { user, prisma, request: req, response: res, eventHub: EventHub, ss };
  },
});

export default handler()
  .use(cors(corsOptions))
  .use(cookieParser())
  .use(apolloServer.createHandler({ path: "/api" }));
