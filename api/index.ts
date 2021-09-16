// const { ApolloServer } = require('apollo-server-micro');
//const { ApolloServer, gql } = require('apollo-server');

const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { makeExecutableSchema } = require("graphql-tools");
const { SubscriptionServer } = require("subscriptions-transport-ws");

require("dotenv").config();
const bodyParser = require("body-parser");
const pretixWebhook = require("./webhooks/pretix");
const schema = require("./schema");
import resolvers from "./resolvers";
const { getModels } = require("./database/models");
const EventHub = require("./services/eventHub.service");
const {
  db: { getConnection },
} = require("@sensestack/plato-core");
const initKcAdminClient = require("./utils/initKcAdminClient");

const Keycloak = require("keycloak-connect");
const { KeycloakContext } = require("keycloak-connect-graphql");

const subscribers = require("./subscribers/index");

const app = express();
const keycloak = new Keycloak(
  {},
  {
    realm: process.env.KEYCLOAK_REALM,
    "auth-server-url": process.env.KEYCLOAK_AUTH_SERVER,
    "ssl-required": "external",
    resource: "dreams",
    credentials: {
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
    },
    "confidential-port": 0,
  }
);

app.use("/graphql", keycloak.middleware());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  subscriptions: { path: "/subscriptions" },
  formatError: (err: any) => {
    return process.env.NODE_ENV === "production" ? new Error(err.message) : err;
  },
  context: async ({ req }: { req: any }) => {
    let kauth;
    try {
      kauth = new KeycloakContext({ req });
    } catch (err) {
      console.log(err);
    }

    const db = await getConnection(process.env.MONGO_URL);
    const models = getModels(db);

    let currentUser = kauth && kauth.accessToken && kauth.accessToken.content;

    let currentOrg = null;
    let currentOrgMember;

    const subdomain = req.headers["dreams-subdomain"];
    const customDomain = req.headers["dreams-customdomain"];
    if (customDomain) {
      currentOrg = await models.Organization.findOne({ customDomain });
    } else if (subdomain) {
      currentOrg = await models.Organization.findOne({ subdomain });
    }

    if (currentOrg && currentUser) {
      currentOrgMember = await models.OrgMember.findOne({
        organizationId: currentOrg.id,
        userId: currentUser.sub,
      });
    }

    const kcAdminClient = await initKcAdminClient();

    return {
      models,
      eventHub: EventHub,
      kauth: currentUser,
      currentOrg,
      currentOrgMember,
      kcAdminClient,
      // kauth,
    };
  },
  playground: true,
  introspection: true,
});

server.applyMiddleware({ app });

app.use(bodyParser.json());

app.post("/pretix", pretixWebhook);

const port = process.env.PORT || 4000;

subscribers.initialize(EventHub);

const appWithSockets = createServer(app);
appWithSockets.listen(port, () => {
  delete (resolvers as any).Upload; // Where did Upload come from?
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema: makeExecutableSchema({ typeDefs: schema, resolvers }),
    },
    { server: appWithSockets, path: appWithSockets.subscriptionsPath }
  );
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
  console.log(
    `🚀 Websockets ready at ws://localhost:${port}${server.subscriptionsPath}`
  );
});

// module.exports = cors((req, res) => {
//   if (req.method === 'OPTIONS') {
//     res.end();
//     return;
//   }
//   return server.createHandler({ path: '/api' })(req, res);
// });
