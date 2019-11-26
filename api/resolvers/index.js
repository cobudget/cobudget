import _ from 'lodash';
import slugify from 'slugify';

const resolvers = {
  Query: {
    currentUser: (parent, args, { currentUser }) => {
      return currentUser;
    },
    user: async (parent, { id }, { models: { User } }) => {
      return User.findOne({ id });
    },
    users: async (parent, { id }, { models: { User } }) => {
      return User.find();
    },
    events: async (parent, args, { models: { Event } }) => {
      return Event.find();
    },
    event: async (parent, { slug }, { models: { Event } }) => {
      return Event.findOne({ slug });
    },
    dream: async (parent, { slug }, { models: { Dream } }) => {
      return Dream.findOne({ slug });
    }
  },
  Mutation: {
    createEvent: async (
      parent,
      { slug, title, description },
      { currentUser, models: { Event, Membership } }
    ) => {
      if (!currentUser) throw new Error('You need to be logged in');

      const event = await new Event({
        slug,
        title,
        description
      });

      await new Membership({
        userId: currentUser._id,
        eventId: event._id,
        isAdmin: true
      }).save();

      return event.save();
    },
    createDream: async (
      parent,
      { eventSlug, title, description, budget, minGrant },
      { currentUser, models: { Event, Dream, Membership } }
    ) => {
      if (!currentUser) throw new Error('You need to be logged in');

      const event = await Event.findOne({ slug: eventSlug });

      // Check if currentUser is a member of this event. (improvement: add these functions to the currentUser object)
      const member = await Membership.findOne({
        userId: currentUser.id,
        eventId: event.id
      });

      if (!member) throw new Error('You are not a member of this event');

      return new Dream({
        eventId: event.id,
        slug: slugify(title),
        title,
        description,
        budget,
        teamIds: [currentUser.id],
        minGrant
      }).save();
    },
    createUser: async (parent, { name, email }, { models: { User } }) => {
      return new User({ name, email }).save();
    },
    dropStuff: async (parent, args, { models: { Event, Membership } }) => {
      await Event.collection.drop();
      await Membership.collection.drop();
      return true;
    }
  },
  User: {
    memberships: async (
      user,
      args,
      { currentUser, models: { Membership } }
    ) => {
      return Membership.find({ userId: currentUser.id });
    }
  },
  Membership: {
    user: async (membership, args, { models: { User } }) => {
      return User.findOne({ _id: membership.userId });
    },
    event: async (membership, args, { models: { Event } }) => {
      return Event.findOne({ _id: membership.eventId });
    }
  },
  Event: {
    members: async (event, args, { models: { Membership } }) => {
      return Membership.find({ eventId: event.id });
    },
    dreams: async (event, args, { models: { Dream } }) => {
      return Dream.find({ eventId: event.id });
    }
  },
  Dream: {
    team: async (dream, args, { models: { User } }) => {
      return User.find({ _id: { $in: dream.teamIds } });
    }
  }
};

export default resolvers;
