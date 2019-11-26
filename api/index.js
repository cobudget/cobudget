import { ApolloServer, gql } from 'apollo-server';
import uuidv4 from 'uuid/v4';
import _ from 'lodash';

import schema from './schema';

let users = {
  1: {
    id: '1',
    name: 'Gustav Larsson',
    email: 'gustav.larsson@gmail.com',
    membershipIds: [1]
  },
  2: {
    id: '2',
    name: 'Dave Davids',
    email: 'dave.davids@gmail.com',
    membershipIds: [2]
  }
};

let memberships = {
  1: {
    id: '1',
    userId: '1',
    eventId: '1',
    isAdmin: true
  },
  2: {
    id: '2',
    userId: '2',
    eventId: '2',
    isAdmin: true
  }
};

let events = {
  1: {
    id: '1',
    slug: 'borderland2020',
    title: 'Borderland 2020',
    description: 'where dreams meet reality',
    membershipIds: ['1']
  },
  2: {
    id: '2',
    slug: 'sthlm-micro-burn',
    title: 'Sthlm Micro Burn 2020',
    membershipIds: ['2']
  }
};

const resolvers = {
  Query: {
    currentUser: (parent, args, { currentUser }) => {
      return currentUser;
    },
    user: (parent, { id }) => {
      return users[id];
    },
    events: () => {
      return Object.values(events);
    },
    event: (parent, { slug }, context) => {
      return _.find(events, { slug: slug });
    }
  },
  Mutation: {
    createEvent: (parent, { slug, title, description }, { currentUser }) => {
      const eventId = uuidv4();
      const membershipId = uuidv4();
      const membership = {
        id: membershipId,
        userId: currentUser.id,
        eventId: eventId,
        isAdmin: true
      };
      const event = {
        id: eventId,
        slug,
        title,
        description,
        membershipIds: [membershipId]
      };
      events[eventId] = event;
      memberships[membershipId] = membership;
      users[me.id].membershipIds.push(membershipId);
      return event;
    }
  },
  User: {
    memberships: user => {
      return Object.values(memberships).filter(
        membership => membership.userId === user.id
      );
    }
  },
  Membership: {
    user: membership => {
      return users[membership.userId];
    },
    event: membership => {
      return events[membership.eventId];
    }
  },
  Event: {
    members: event => {
      return Object.values(memberships).filter(
        membership => membership.eventId === event.id
      );
    }
  }
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    currentUser: users[1]
  },
  introspection: true
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
