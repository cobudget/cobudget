// const { ApolloServer } = require('apollo-server-micro');
//const { ApolloServer, gql } = require('apollo-server');

const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const bodyParser = require('body-parser');
const pretixWebhook = require('./webhooks/pretix');
const schema = require('./schema');
const resolvers = require('./resolvers');
const { getModels } = require('./database/models');
const {
  db: { getConnection },
} = require('plato-core');

const Keycloak = require('keycloak-connect');
const { KeycloakContext } = require('keycloak-connect-graphql');

const app = express();
const keycloak = new Keycloak(
  {},
  {
    realm: 'plato',
    'auth-server-url': 'https://auth.platoproject.org/auth/',
    'ssl-required': 'external',
    resource: 'dreams',
    'public-client': true,
    'confidential-port': 0,
  }
);

app.use('/graphql', keycloak.middleware());

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({ req }) => {
    const kauth = new KeycloakContext({ req });
    console.log({
      kauth,
      content: kauth.accessToken && kauth.accessToken.content,
    });

    const db = await getConnection(process.env.MONGO_URL);
    const models = getModels(db);

    let currentUser = null;
    let currentOrg = null;

    const subdomain = req.headers['dreams-subdomain'];
    const customDomain = req.headers['dreams-customdomain'];
    if (customDomain) {
      currentOrg = await models.Organization.findOne({ customDomain });
    } else if (subdomain) {
      currentOrg = await models.Organization.findOne({ subdomain });
    }

    let token = req.headers.authorization
      ? req.headers.authorization.split(' ')[1]
      : null;
    console.log({ tokenOnServer: token });
    // Verify token if available
    // if (currentOrg && token) {
    //   try {
    //     token = jwt.verify(token, process.env.JWT_SECRET);
    //     currentUser = await models.User.findOne({
    //       _id: token.sub,
    //       organizationId: currentOrg.id,
    //     });
    //   } catch (error) {
    //     // throw new AuthenticationError(
    //     //   'Authentication token is invalid, please log in.'
    //     // );
    //     console.error('Authentication token is invalid');
    //     console.error(error);
    //   }
    // }

    return {
      models,
      currentUser,
      currentOrg,
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
