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
import { NextApiRequest, NextApiResponse } from "next";

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

const apolloServer = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({ req, res }): Promise<GraphQLContext> => {
    const { user } = req;
    // 'ss' is SuperAdminSession
    let ss;
    try {
      ss = verify(req.cookies.ss);
    } catch (err) {
      ss = null;
    }

    return {
      user,
      prisma,
      request: req,
      eventHub: EventHub,
      response: res,
      ss,
    };
  },
});

// Apollo Server 3 requires start() to be called before createHandler()
const serverStartPromise = apolloServer.start();

export default async function apiHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Create the middleware chain with next-connect
  const middleware = handler().use(cors(corsOptions)).use(cookieParser());

  // Run the middleware chain first
  await new Promise<void>((resolve, reject) => {
    middleware.run(req, res, (err?: Error) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Ensure Apollo Server has started
  await serverStartPromise;

  // Create and run the Apollo handler
  const apolloHandler = apolloServer.createHandler({ path: "/api" });
  return apolloHandler(req, res);
}
