// const { ApolloServer } = require('apollo-server-micro');
//const { ApolloServer, gql } = require('apollo-server');

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const KcAdminClient = require('keycloak-admin').default;

const jwt = require('jsonwebtoken');
require('dotenv').config();
const bodyParser = require('body-parser');
const pretixWebhook = require('./webhooks/pretix');
const schema = require('./schema');
const resolvers = require('./resolvers');
const { getModels } = require('./database/models');
const {
  db: { getConnection },
} = require('@sensestack/plato-core');

const Keycloak = require('keycloak-connect');
const { KeycloakContext } = require('keycloak-connect-graphql');

const app = express();
const keycloak = new Keycloak(
  {},
  {
    realm: 'plato',
    'auth-server-url': process.env.KEYCLOAK_AUTH_SERVER,
    'ssl-required': 'external',
    resource: 'dreams',
    credentials: {
      secret: process.env.KEYCLOAK_CLIENT_SECRET,
    },
    'confidential-port': 0,
  }
);

app.use('/graphql', keycloak.middleware());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({ req }) => {
    let kauth;
    try {
      kauth = new KeycloakContext({ req });
    } catch (err) {
      console.log(err);
    }

    const db = await getConnection(process.env.MONGO_URL);
    const models = getModels(db);

    const kcAdminClient = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_AUTH_SERVER,
      realmName: 'master',
      requestConfig: {
        /* Axios request config options https://github.com/axios/axios#request-config */
      },
    });

    // Authorize with username / password
    await kcAdminClient.auth({
      username: process.env.KEYCLOAK_ADMIN_USERNAME,
      password: process.env.KEYCLOAK_ADMIN_PASSWORD,
      grantType: 'password',
      clientId: 'admin-cli',
      totp: '123456', // optional Time-based One-time Password if OTP is required in authentication flow
    });

    kcAdminClient.setConfig({
      realmName: 'plato',
    });

    let currentUser = kauth && kauth.accessToken && kauth.accessToken.content;

    let currentOrg = null;
    let currentOrgMember;

    const subdomain = req.headers['dreams-subdomain'];
    const customDomain = req.headers['dreams-customdomain'];
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

    let token = req.headers.authorization
      ? req.headers.authorization.split(' ')[1]
      : null;

    return {
      models,
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

app.post('/pretix', pretixWebhook);

const port = process.env.PORT || 4000;

app.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  )
);

// module.exports = cors((req, res) => {
//   if (req.method === 'OPTIONS') {
//     res.end();
//     return;
//   }
//   return server.createHandler({ path: '/api' })(req, res);
// });
