const slugify = require('../utils/slugify');
const { generateLoginJWT } = require('../utils/auth');
const {
  sendMagicLinkEmail,
  sendInviteEmails,
  sendRequestToJoinNotifications
} = require('../utils/email');

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
    },
    members: async (parent, args, { currentMember, models: { Member } }) => {
      if (!currentMember) throw new Error('Need to be logged in');
      if (!currentMember.isAdmin) throw new Error('You need to be admin');
      // eventId === currentMember.eventId throw error.. wrong page..
      return Member.find({ eventId: currentMember.eventId });
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
        isAdmin: true,
        isApproved: true
      });

      const [savedEvent] = await Promise.all([event.save(), member.save()]);

      const token = await generateLoginJWT(member);
      await sendMagicLinkEmail(member, token, event);

      return savedEvent;
    },
    editEvent: async (
      parent,
      {
        slug,
        title,
        currency,
        registrationPolicy,
        totalBudget,
        grantValue,
        grantsPerMember
      },
      { currentMember, models: { Event } }
    ) => {
      if (!currentMember || !currentMember.isAdmin)
        throw new Error('You need to be admin to edit event');

      const event = await Event.findOne({ _id: currentMember.eventId });

      if (slug) event.slug = slugify(slug);
      if (title) event.title = title;
      if (currency) event.currency = currency;
      if (registrationPolicy) event.registrationPolicy = registrationPolicy;
      if (totalBudget) event.totalBudget = totalBudget;
      if (grantValue) event.grantValue = grantValue; // cant delete grantValue right now..
      if (grantsPerMember) event.grantsPerMember = grantsPerMember;

      return event.save();
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
      { currentMember, models: { Dream } }
    ) => {
      if (!currentMember || !currentMember.isApproved)
        throw new Error('You need to be logged in and/or approved');

      if (currentMember.eventId.toString() !== eventId)
        throw new Error('You are not a member of this event');

      // if maxGoal is defined, it needs to be larger than minGoal, that also needs to be defined
      if (maxGoal && (maxGoal <= minGoal || minGoal == null))
        throw new Error('max goal needs to be larger than min goal');

      return new Dream({
        eventId: currentMember.eventId,
        title,
        slug: slugify(slug),
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
      dream.slug = slugify(slug);
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
        let isApproved;

        switch (event.registrationPolicy) {
          case 'OPEN':
            isApproved = true;
            break;
          case 'REQUEST_TO_JOIN':
            isApproved = false;
            break;
          case 'INVITE_ONLY':
            throw new Error('This event is invite only');
          default:
            throw new Error('Event has no registration policy');
        }

        member = await new Member({ email, eventId, isApproved }).save();
      }

      return await sendMagicLinkEmail(member, event);
    },
    updateProfile: async (
      parent,
      { name, avatar },
      { currentMember, models: { Member, Event } }
    ) => {
      if (!currentMember) throw new Error('You need to be logged in..');

      const member = await Member.findOne({ _id: currentMember.id });

      // first time a member signs in
      if (!member.name) {
        member.verifiedEmail = true;

        if (!member.isApproved) {
          // ping admins that there is a request to join
          const event = await Event.findOne({ _id: currentMember.eventId });
          const admins = await Member.find({
            eventId: currentMember.eventId,
            isAdmin: true
          });
          await sendRequestToJoinNotifications(member, event, admins);
        }
      }

      if (name) member.name = name;
      if (avatar) member.avatar = avatar;

      return member.save();
    },
    inviteMembers: async (
      parent,
      { emails },
      { currentMember, models: { Member, Event } }
    ) => {
      if (!currentMember || !currentMember.isAdmin)
        throw new Error('You need to be admin to invite new members');

      const emailArray = emails.split(',');

      if (emailArray.length > 1000)
        throw new Error('You can only invite 1000 people at a time.');

      const memberObjs = emailArray.map(email => ({
        email: email.trim(),
        eventId: currentMember.eventId,
        isApproved: true
      }));

      let members = [];

      for (memberObj of memberObjs) {
        try {
          members.push(await new Member(memberObj).save());
        } catch (error) {
          console.log(error);
        }
      }

      const event = await Event.findOne({ _id: currentMember.eventId });

      if (members.length > 0) await sendInviteEmails(members, event);

      return members;
    },
    updateMember: async (
      parent,
      { memberId, isApproved, isAdmin },
      { currentMember, models: { Member } }
    ) => {
      if (!currentMember || !currentMember.isAdmin)
        throw new Error('You need to be admin to update member');

      const member = await Member.findOne({
        _id: memberId,
        eventId: currentMember.eventId
      });

      if (!member) throw new Error('No member to update found');

      if (typeof isApproved !== 'undefined') {
        member.isApproved = isApproved;
      } // send notification on approving?
      if (typeof isAdmin !== 'undefined') {
        member.isAdmin = isAdmin;
      }
      return member.save();
    },
    deleteMember: async (
      parent,
      { memberId },
      { currentMember, models: { Member } }
    ) => {
      if (!currentMember || !currentMember.isAdmin)
        throw new Error('You need to be admin to delete member');
      const member = await Member.findOneAndDelete({
        _id: memberId,
        eventId: currentMember.eventId
      });
      return member;
    },
    grant: async (
      parent,
      { dreamId, value },
      { currentMember, models: { Grant } }
    ) => {
      if (!currentMember || !currentMember.isApproved)
        throw new Error(
          'You need to be a logged in approved member to grant things'
        );

      //TOOD:
      // check dream granting toggle
      // check granting is closed/open?
      // check dream is not already fully funded
      // check user has grants to spend
      // check total budget is not exceeded

      return new Grant({
        eventId: currentMember.eventId,
        dreamId,
        value,
        memberId: currentMember.id
      }).save();
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
    },
    minGoalGrants: async (dream, args, { models: { Event } }) => {
      const { grantValue } = await Event.findOne({ _id: dream.eventId });
      if (dream.minGoal === null || !grantValue) {
        return null;
      }
      return Math.ceil(dream.minGoal / grantValue);
    },
    maxGoalGrants: async (dream, args, { models: { Event } }) => {
      const { grantValue } = await Event.findOne({ _id: dream.eventId });
      if (dream.maxGoal === null || !grantValue) {
        return null;
      }
      return Math.ceil(dream.maxGoal / grantValue);
    },
    currentNumberOfGrants: async (dream, args, { models: { Grant } }) => {
      const grants = await Grant.find({ dreamId: dream.id });
      return grants.reduce(
        (prevValue, currentValue) => prevValue + currentValue.value,
        0
      );
    }
  },
  Grant: {
    dream: async (grant, args, { models: { Dream } }) => {
      return Dream.findOne({ _id: grant.dreamId });
    }
  }
};

module.exports = resolvers;
