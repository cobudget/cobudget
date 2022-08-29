import { ApolloServer } from "apollo-server-micro";
import cors from "cors";
import prisma from "../../server/prisma";
import schema from "../../server/graphql/schema";
import resolvers from "../../server/graphql/resolvers";
import EventHub from "../../server/services/eventHub.service";
import handler from "../../server/api-handler";
import subscribers from "../../server/subscribers";

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
  response?: any
}

const corsOptions = {
  origin: "*",
  credentials: "include",
};

subscribers.initialize(EventHub);

export default handler()
  .use(cors(corsOptions))
  .use(
    new ApolloServer({
      typeDefs: schema,
      resolvers,
      context: async ({ req, res }): Promise<GraphQLContext> => {
        const { user } = req;

        return {
          user,
          prisma,
          request: req,
          eventHub: EventHub,
          response: res,
        };
      },
    }).createHandler({
      path: "/api",
    })
  );
