import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../server/prisma";
import schema from "../../server/graphql/schema";
import resolvers from "../../server/graphql/resolvers";
import EventHub from "../../server/services/eventHub.service";
import subscribers from "../../server/subscribers";
import { verify } from "server/utils/jwt";
import { parse } from "cookie";

export const config = {
  api: {
    bodyParser: false,
  },
};

export interface GraphQLContext {
  user?: Express.User;
  prisma: typeof prisma;
  eventHub?: any;
  request?: NextApiRequest;
  response?: NextApiResponse;
  ss?: { id: string };
}

subscribers.initialize(EventHub);

const server = new ApolloServer<GraphQLContext>({
  typeDefs: schema,
  resolvers,
});

const handler = startServerAndCreateNextHandler<NextApiRequest, GraphQLContext>(
  server,
  {
    context: async (req, res): Promise<GraphQLContext> => {
      const cookies = parse(req.headers.cookie || "");

      // 'ss' is SuperAdminSession
      let ss;
      try {
        ss = verify(cookies.ss);
      } catch (err) {
        ss = null;
      }

      // Get user from request (set by auth middleware if available)
      const user = (req as any).user;

      return {
        user,
        prisma,
        request: req,
        eventHub: EventHub,
        response: res,
        ss,
      };
    },
  }
);

export default async function apiHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  return handler(req, res);
}
