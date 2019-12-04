import { ApolloServer, AuthenticationError } from 'apollo-server-micro';
import cors from 'micro-cors';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import schema from './schema';
import resolvers from './resolvers';
import { getModels } from './database/models';
import { getConnection } from './database/connection';

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({ req }) => {
    const db = await getConnection();
    const models = getModels(db);
    let currentUser = null;

    let token = req.headers.authorization
      ? req.headers.authorization.split(' ')[1]
      : null;

    // Verify token if available
    if (token) {
      try {
        token = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await models.User.findOne({ _id: token.sub });
      } catch (error) {
        throw new AuthenticationError(
          'Authentication token is invalid, please log in.'
        );
      }
    }

    return {
      models,
      currentUser
    };
  },
  playground: true,
  introspection: true
});

export default cors()((req, res) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  return server.createHandler({ path: '/api' })(req, res);
});
