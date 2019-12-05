import slugify from 'slugify';
import { generateLoginJWT } from '../utils/auth';
import { sendMagicLinkEmail } from '../utils/email';

const resolvers = {
  Query: {
    currentUser: (parent, args, { currentUser }) => {
      return currentUser;
    },
    events: async (parent, args, { models: { Event } }) => {
      return Event.find();
    },
    event: async (parent, { slug }, { models: { Event } }) => {
      return Event.findOne({ slug });
    },
    dream: async (parent, { slug, eventId }, { models: { Dream } }) => {
      return Dream.findOne({ slug, eventId });
    }
  },
  Mutation: {
    createEvent: async (
      parent,
      { slug, title, description },
      { currentUser, models: { Event, Membership } }
    ) => {
      if (!currentUser) throw new Error('You need to be logged in');

      const event = await new Event({ slug, title, description });

      const membership = await new Membership({
        userId: currentUser.id,
        eventId: event.id,
        isAdmin: true
      });

      const [savedEvent] = await Promise.all([event.save(), membership.save()]);
      return savedEvent;
    },
    createDream: async (
      parent,
      { eventId, title, description, budgetDescription, minFunding },
      { currentUser, models: { Membership, Dream } }
    ) => {
      if (!currentUser) throw new Error('You need to be logged in');

      const member = await Membership.findOne({
        userId: currentUser.id,
        eventId
      });

      if (!member) throw new Error('You are not a member of this event');

      return new Dream({
        eventId,
        title,
        slug: slugify(title).toLowerCase(),
        description,
        teamIds: [currentUser.id],
        budgetDescription,
        minFunding
      }).save();
    },
    sendMagicLink: async (
      parent,
      { email: inputEmail },
      { models: { User } }
    ) => {
      const email = inputEmail.toLowerCase();
      const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (!emailRegex.test(email)) throw new Error('Not a valid email address');

      let user = await User.findOne({ email });

      if (!user) {
        user = await new User({ email }).save();
      }

      const token = await generateLoginJWT(user);
      return await sendMagicLinkEmail(user, token);
    }
  },
  User: {
    memberships: async (user, args, { models: { Membership } }) => {
      return Membership.find({ userId: user.id });
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
    memberships: async (event, args, { models: { Membership } }) => {
      return Membership.find({ eventId: event.id });
    },
    dreams: async (event, args, { models: { Dream } }) => {
      return Dream.find({ eventId: event.id });
    }
  },
  Dream: {
    team: async (dream, args, { models: { User } }) => {
      return User.find({ _id: { $in: dream.teamIds } });
    },
    event: async (dream, args, { models: { Event } }) => {
      return Event.find({ _id: dream.eventId });
    }
  }
};

export default resolvers;
