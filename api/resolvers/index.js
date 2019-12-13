import urlSlug from 'url-slug';
import { generateLoginJWT } from '../utils/auth';
import { sendMagicLinkEmail } from '../utils/email';

const resolvers = {
  Query: {
    currentMember: (parent, args, { currentMember }) => {
      return currentMember;
    },
    events: async (parent, args, { models: { Event } }) => {
      return Event.find();
    },
    event: async (parent, { slug }, { models: { Event } }) => {
      return Event.findOne({ slug });
    },
    dream: async (parent, { eventId, slug }, { models: { Dream } }) => {
      return Dream.findOne({ eventId, slug });
    },
    dreams: async (parent, { eventId }, { models: { Dream } }) => {
      return Dream.find({ eventId });
    }
  },
  Mutation: {
    createEvent: async (
      parent,
      { adminEmail, slug, title, description, currency, registrationPolicy },
      { models: { Event, Member } }
    ) => {
      // check slug..
      const event = await new Event({
        slug,
        title,
        description,
        currency,
        registrationPolicy
      });

      const member = await new Member({
        email: adminEmail,
        eventId: event.id,
        isAdmin: true
      });

      const [savedEvent] = await Promise.all([event.save(), member.save()]);

      const token = await generateLoginJWT(member);
      await sendMagicLinkEmail(member, token, event);

      return savedEvent;
    },
    createDream: async (
      parent,
      {
        eventId,
        title,
        slug,
        description,
        budgetDescription,
        minGoal,
        maxGoal,
        images
      },
      { currentMember, models: { Member, Dream } }
    ) => {
      if (!currentMember) throw new Error('You need to be logged in');

      const member = await Member.findOne({
        _id: currentMember.id,
        eventId
      });

      if (!member) throw new Error('You are not a member of this event');

      // if maxGoal is defined, it needs to be larger than minGoal, that also needs to be defined
      if (maxGoal && (maxGoal <= minGoal || minGoal == null))
        throw new Error('max goal needs to be larger than min goal');

      return new Dream({
        eventId,
        title,
        slug: urlSlug(slug),
        description,
        members: [currentMember.id],
        budgetDescription,
        minGoal,
        maxGoal,
        images
      }).save();
    },
    editDream: async (
      parent,
      { dreamId, title, slug, description, minGoal, maxGoal, images },
      { currentMember, models: { Dream } }
    ) => {
      if (!currentMember) throw new Error('You need to be logged in');

      const dream = await Dream.findOne({
        _id: dreamId
      });

      if (!dream.members.includes(currentMember.id))
        throw new Error('You are not a member of this dream');

      dream.title = title;
      dream.slug = urlSlug(slug);
      dream.description = description;
      dream.minGoal = minGoal;
      dream.maxGoal = maxGoal;
      dream.images = images;

      return await dream.save();
    },
    sendMagicLink: async (
      parent,
      { email: inputEmail, eventId },
      { models: { Member, Event } }
    ) => {
      const email = inputEmail.toLowerCase();
      const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (!emailRegex.test(email)) throw new Error('Not a valid email address');

      const event = await Event.findOne({ _id: eventId });
      if (!event) throw new Error('Did not find event');

      let member = await Member.findOne({ email, eventId });

      if (!member) {
        // if(event.registrationPolicy !== 'OPEN') throw new Error('Not open for registrations')
        member = await new member({ email, eventId }).save();
      }

      const token = await generateLoginJWT(member);
      return await sendMagicLinkEmail(member, token, event);
    },
    updateCurrentMember: async (
      parent,
      { name, avatar },
      { currentMember, models: { Member } }
    ) => {
      if (!currentMember) throw new Error('You need to be logged in..');

      const member = await Member.findOne({ _id: currentMember.id });

      if (!member.name) {
        // if event is `REQUEST_TO_JOIN`, then you can send ping to admins or guides here
        // if event is unapproved... meaning, person never signed in, we can confirm event here.
        // until this happens other can register this event.
      }

      if (name) member.name = name;
      if (avatar) member.avatar = avatar;

      return member.save();
    }
  },
  Member: {
    event: async (member, args, { models: { Event } }) => {
      return Event.findOne({ _id: member.eventId });
    }
  },
  Event: {
    members: async (event, args, { models: { Member } }) => {
      return Member.find({ eventId: event.id });
    },
    dreams: async (event, args, { models: { Dream } }) => {
      return Dream.find({ eventId: event.id });
    }
  },
  Dream: {
    members: async (dream, args, { models: { Member } }) => {
      return Member.find({ _id: { $in: dream.members } });
    },
    event: async (dream, args, { models: { Event } }) => {
      return Event.findOne({ _id: dream.eventId });
    }
  }
};

export default resolvers;
