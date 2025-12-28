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
let apolloHandler: ReturnType<typeof apolloServer.createHandler> | null = null;

const startServer = apolloServer.start().then(() => {
  apolloHandler = apolloServer.createHandler({ path: "/api" });
});

// Use next-connect properly - chain middleware and end with handler
export default handler()
  .use(cors(corsOptions))
  .use(cookieParser())
  .all(async (req: NextApiRequest, res: NextApiResponse) => {
    // Wait for Apollo Server to be ready
    await startServer;

    if (!apolloHandler) {
      res.status(500).json({ error: "Apollo Server not initialized" });
      return;
    }

    return apolloHandler(req, res);
  });
