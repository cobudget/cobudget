import { ApolloServer } from 'apollo-server-micro';
import cors from 'micro-cors';
import 'dotenv/config';
import schema from './schema';
import resolvers from './resolvers';
import { getModels } from './database/models';
import { getConnection } from './database/connection';

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async () => {
    const db = await getConnection();
    const models = getModels(db);
    return {
      models,
      currentUser: await models.User.findOne({
        email: 'test@gmail.com'
      })
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
