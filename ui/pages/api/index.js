import { ApolloServer } from "apollo-server-micro";
import prisma from "../../server/prisma";
import { getRequestOrigin } from "../../server/get-request-origin";
import schema from "../../server/graphql/schema";
import resolvers from "../../server/graphql/resolvers";

export const config = {
  api: {
    bodyParser: false,
  },
};

const apolloServer = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: ({ req }) => {
    console.log({ req });
    return {
      user: req.user,
      origin: getRequestOrigin(req),
      prisma,
    };
  },
});

const startServer = apolloServer.start();

const apolloHandler = async function (req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://studio.apollographql.com"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Headers"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, PATCH, DELETE, OPTIONS, HEAD"
  );
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  await startServer;
  await apolloServer.createHandler({
    path: "/api",
  })(req, res);
};

export default apolloHandler;
