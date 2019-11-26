import uuidv4 from 'uuid/v4';
import _ from 'lodash';

const resolvers = {
  Query: {
    currentUser: (parent, args, { currentUser }) => {
      return currentUser;
    },
    user: (parent, { id }, { models }) => {
      return models.users[id];
    },
    events: (parent, args, { models }) => {
      return Object.values(models.events);
    },
    event: (parent, { slug }, { models }) => {
      return _.find(models.events, { slug: slug });
    }
  },
  Mutation: {
    createEvent: (
      parent,
      { slug, title, description },
      { currentUser, models }
    ) => {
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
      models.events[eventId] = event;
      models.memberships[membershipId] = membership;
      models.users[me.id].membershipIds.push(membershipId);
      return event;
    }
  },
  User: {
    memberships: (user, args, { models }) => {
      return Object.values(models.memberships).filter(
        membership => membership.userId === user.id
      );
    }
  },
  Membership: {
    user: (membership, args, { models }) => {
      return models.users[membership.userId];
    },
    event: (membership, args, { models }) => {
      return models.events[membership.eventId];
    }
  },
  Event: {
    members: (event, args, { models }) => {
      return Object.values(models.memberships).filter(
        membership => membership.eventId === event.id
      );
    }
  }
};

export default resolvers;
