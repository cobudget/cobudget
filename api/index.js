import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose';
import 'dotenv/config';
import schema from './schema';
import resolvers from './resolvers';
import models from './models';

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async () => ({
    models,
    currentUser: await models.User.findOne({
      email: 'gustav.larsson@gmail.com'
    })
  }),
  playground: true,
  introspection: true,
  cors: true
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
