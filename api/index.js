import { ApolloServer } from 'apollo-server';
import mongoose from 'mongoose';
import 'dotenv/config';
import schema from './schema';
import resolvers from './resolvers';
import models from './models';

mongoose.connect('mongodb://localhost/dreams');

// currentUser hack :-)
models.User.findOne({ name: 'David' })
  .exec()
  .then(currentUser => {
    const server = new ApolloServer({
      typeDefs: schema,
      resolvers,
      context: {
        models,
        currentUser
      },
      introspection: true
    });

    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  });
