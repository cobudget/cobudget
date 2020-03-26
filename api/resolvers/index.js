const slugify = require('../utils/slugify');
const {
  sendMagicLinkEmail,
  sendInviteEmails,
  sendRequestToJoinNotifications
} = require('../utils/email');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const mongoose = require('mongoose');
const dayjs = require('dayjs');

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
      {
        adminEmail,
        slug,
        title,
        description,
        summary,
        currency,
        registrationPolicy
      },
      { models: { Event, Member } }
    ) => {
      // check slug..
      const event = await new Event({
        slug,
        title,
        description,
        summary,
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

      await sendMagicLinkEmail(member, event);

      return savedEvent;
    },
    editEvent: async (
      parent,
      { slug, title, registrationPolicy },
      { currentMember, models: { Event } }
    ) => {
      if (!currentMember || !currentMember.isAdmin)
        throw new Error('You need to be admin to edit event');

      const event = await Event.findOne({ _id: currentMember.eventId });

      if (slug) event.slug = slugify(slug);
      if (title) event.title = title;
      if (registrationPolicy) event.registrationPolicy = registrationPolicy;

      return event.save();
    },
    createDream: async (
      parent,
      {
        eventId,
        title,
        slug,
        description,
        summary,
        budgetDescription,
        minGoal,
        maxGoal,
        images,
        budgetItems
      },
      { currentMember, models: { Dream, Event } }
    ) => {
      if (!currentMember || !currentMember.isApproved)
        throw new Error('You need to be logged in and/or approved');

      if (currentMember.eventId.toString() !== eventId)
        throw new Error('You are not a member of this event');

      const event = await Event.findOne({ _id: currentMember.eventId });

      if (!event.dreamCreationIsOpen)
        throw new Error('Dream creation has closed');

      // if maxGoal is defined, it needs to be larger than minGoal, that also needs to be defined
      if (maxGoal && (maxGoal <= minGoal || minGoal == null))
        throw new Error('max goal needs to be larger than min goal');

      return new Dream({
        eventId: currentMember.eventId,
        title,
        slug: slugify(slug),
        description,
        summary,
        members: [currentMember.id],
        budgetDescription,
        minGoal,
        maxGoal,
        images,
        budgetItems
      }).save();
    },
    editDream: async (
      parent,
      {
        dreamId,
        title,
        slug,
        description,
        summary,
        minGoal,
        maxGoal,
        images,
        budgetItems
      },
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
      dream.summary = summary;
      dream.minGoal = minGoal;
      dream.maxGoal = maxGoal;
      dream.images = images;
      dream.budgetItems = budgetItems;

      return await dream.save();
    },
    addComment: async (
      parent,
      { content, dreamId },
      { currentMember, models: { Dream } }
    ) => {
      if (!currentMember || !currentMember.isApproved)
        throw new Error('You need to be logged in and/or approved');

      if (content.length === 0) throw new Error('You need content!');

      const dream = await Dream.findOne({
        _id: dreamId,
        eventId: currentMember.eventId
      });

      dream.comments.push({
        authorId: currentMember.id,
        content
      });

      return await dream.save();
    },
    deleteComment: async (
      parent,
      { dreamId, commentId },
      { currentMember, models: { Dream } }
    ) => {
      if (!currentMember || !currentMember.isApproved)
        throw new Error('You need to be logged in and/or approved');

      const dream = await Dream.findOne({
        _id: dreamId,
        eventId: currentMember.eventId
      });

      dream.comments = dream.comments.filter(comment => {
        if (
          comment._id.toString() === commentId &&
          (comment.authorId.toString() === currentMember.id ||
            currentMember.isAdmin)
        )
          return false;
        return true;
      });

      return dream.save();
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
    approveForGranting: async (
      parent,
      { dreamId, approved },
      { currentMember, models: { Dream } }
    ) => {
      if (!currentMember || !currentMember.isAdmin)
        throw new Error('You need to be admin to approve for granting');
      const dream = await Dream.findOne({ _id: dreamId });
      dream.approved = approved;
      return dream.save();
    },
    giveGrant: async (
      parent,
      { dreamId, value },
      { currentMember, models: { Grant, Event, Dream } }
    ) => {
      if (!currentMember || !currentMember.isApproved)
        throw new Error(
          'You need to be a logged in approved member to grant things'
        );

      if (value <= 0) throw new Error('Value needs to be more than zero');

      const event = await Event.findOne({ _id: currentMember.eventId });

      // Check that granting is open
      if (!event.grantingIsOpen) throw new Error('Granting is not open');

      const dream = await Dream.findOne({ _id: dreamId });

      if (!dream.approved)
        throw new Error('Dream is not approved for granting');

      // Check that the max goal of the dream is not exceeded
      const [
        { grantsForDream } = { grantsForDream: 0 }
      ] = await Grant.aggregate([
        { $match: { dreamId: mongoose.Types.ObjectId(dreamId) } },
        { $group: { _id: null, grantsForDream: { $sum: '$value' } } }
      ]);

      // TODO: Create virtual on dream model instead?
      const maxGoalGrants = Math.ceil(
        Math.max(dream.maxGoal, dream.minGoal) / event.grantValue
      );

      if (grantsForDream + value > maxGoalGrants)
        throw new Error("You can't overfund this dream.");

      // Check that it is not more than is allowed per dream (if this number is set)
      if (event.maxGrantsToDream && value > event.maxGrantsToDream) {
        throw new Error(
          `You can give a maximum of ${event.maxGrantsToDream} grants to one dream`
        );
      }

      // Check that user has not spent more grants than he has
      const [
        { grantsFromUser } = { grantsFromUser: 0 }
      ] = await Grant.aggregate([
        {
          $match: {
            memberId: mongoose.Types.ObjectId(currentMember.id),
            type: 'USER'
          }
        },
        { $group: { _id: null, grantsFromUser: { $sum: '$value' } } }
      ]);

      if (grantsFromUser + value > event.grantsPerMember)
        throw new Error('You are trying to spend too many grants.');

      // Check that total budget of event will not be exceeded
      const [
        { grantsFromEverybody } = { grantsFromEverybody: 0 }
      ] = await Grant.aggregate([
        {
          $match: {
            eventId: mongoose.Types.ObjectId(currentMember.eventId),
            reclaimed: false
          }
        },
        { $group: { _id: null, grantsFromEverybody: { $sum: '$value' } } }
      ]);

      const totalGrantsToSpend = Math.floor(
        event.totalBudget / event.grantValue
      );

      if (grantsFromEverybody + value > totalGrantsToSpend)
        throw new Error('Total budget of event is exeeced with this grant');

      return new Grant({
        eventId: currentMember.eventId,
        dreamId,
        value,
        memberId: currentMember.id
      }).save();
    },
    deleteGrant: async (
      parent,
      { grantId },
      { currentMember, models: { Grant, Event, Dream } }
    ) => {
      if (!currentMember || !currentMember.isApproved)
        throw new Error(
          'You need to be a logged in approved member to remove a grant'
        );

      const event = await Event.findOne({ _id: currentMember.eventId });

      // Check that granting is open
      if (!event.grantingIsOpen)
        throw new Error("Can't remove grant when granting is closed");

      const grant = await Grant.findOneAndDelete({
        _id: grantId,
        memberId: currentMember.id
      });
      return grant;
    },
    reclaimGrants: async (
      parent,
      { dreamId },
      { currentMember, models: { Grant, Event, Dream } }
    ) => {
      if (!currentMember || !currentMember.isAdmin)
        throw new Error('You need to be admin to reclaim grants');

      const event = await Event.findOne({ _id: currentMember.eventId });

      // Granting needs to be closed before you can reclaim grants
      if (!event.grantingHasClosed)
        throw new Error("You can't reclaim grants before granting has closed");

      // If dream has reached minimum funding, you can't reclaim its grants
      const [
        { grantsForDream } = { grantsForDream: 0 }
      ] = await Grant.aggregate([
        {
          $match: {
            dreamId: mongoose.Types.ObjectId(dreamId),
            reclaimed: false
          }
        },
        { $group: { _id: null, grantsForDream: { $sum: '$value' } } }
      ]);

      const dream = await Dream.findOne({ _id: dreamId });

      const minGoalGrants = Math.ceil(dream.minGoal / event.grantValue);

      if (grantsForDream >= minGoalGrants)
        throw new Error(
          "You can't reclaim grants if it has reached minimum funding"
        );

      await Grant.updateMany({ dreamId }, { reclaimed: true });

      return dream;
    },
    preOrPostFund: async (
      parent,
      { dreamId, value },
      { currentMember, models: { Grant, Dream, Event } }
    ) => {
      if (!currentMember || !currentMember.isAdmin)
        throw new Error('You need to be admin to pre or post fund');

      if (value <= 0) throw new Error('Value needs to be more than zero');

      const event = await Event.findOne({ _id: currentMember.eventId });

      // TODO: check whether certain settings are set, like grant value and total budget

      const dream = await Dream.findOne({ _id: dreamId });

      if (!dream.approved)
        throw new Error('Dream is not approved for granting');

      // Check that the max goal of the dream is not exceeded
      const [
        { grantsForDream } = { grantsForDream: 0 }
      ] = await Grant.aggregate([
        {
          $match: {
            dreamId: mongoose.Types.ObjectId(dreamId),
            reclaimed: false
          }
        },
        { $group: { _id: null, grantsForDream: { $sum: '$value' } } }
      ]);

      const maxGoalGrants = Math.ceil(
        Math.max(dream.maxGoal, dream.minGoal) / event.grantValue
      );

      if (grantsForDream + value > maxGoalGrants)
        throw new Error("You can't overfund this dream.");

      // Check that total budget of event will not be exceeded
      const [
        { grantsFromEverybody } = { grantsFromEverybody: 0 }
      ] = await Grant.aggregate([
        {
          $match: {
            eventId: mongoose.Types.ObjectId(currentMember.eventId),
            reclaimed: false
          }
        },
        { $group: { _id: null, grantsFromEverybody: { $sum: '$value' } } }
      ]);

      const totalGrantsToSpend = Math.floor(
        event.totalBudget / event.grantValue
      );

      if (grantsFromEverybody + value > totalGrantsToSpend)
        throw new Error('Total budget of event is exeeced with this grant');

      return new Grant({
        eventId: currentMember.eventId,
        dreamId,
        value,
        type: event.grantingHasClosed ? 'POST_FUND' : 'PRE_FUND',
        memberId: currentMember.id
      }).save();
    },
    updateGrantingSettings: async (
      parent,
      {
        currency,
        grantsPerMember,
        maxGrantsToDream,
        totalBudget,
        grantValue,
        dreamCreationCloses,
        grantingOpens,
        grantingCloses
      },
      { currentMember, models: { Event } }
    ) => {
      if (!currentMember || !currentMember.isAdmin)
        throw new Error('You need to be admin to update granting settings');

      const event = await Event.findOne({ _id: currentMember.eventId });

      const grantingHasStarted = dayjs(event.grantingOpens).isBefore(dayjs());
      const dreamCreationHasClosed = dayjs(event.dreamCreationCloses).isBefore(
        dayjs()
      );

      if (currency) {
        // granting can't have started to change currency
        if (dreamCreationHasClosed) {
          throw new Error(
            "You can't change currency after dream creation closes"
          );
        }
        event.currency = currency;
        event.totalBudget = undefined;
        event.grantValue = undefined;
      }

      if (grantsPerMember) {
        // granting can't have started to change grants per member
        if (grantingHasStarted) {
          throw new Error(
            "You can't change grants per member once granting has started"
          );
        }
        event.grantsPerMember = grantsPerMember;
        event.grantValue = undefined;
      }

      if (maxGrantsToDream) {
        if (grantingHasStarted) {
          throw new Error(
            "You can't change max grants to dream once granting has started"
          );
        }
        event.maxGrantsToDream = maxGrantsToDream;
      }

      if (totalBudget) {
        // can only increase total budget after granting has started
        if (grantingHasStarted && totalBudget < event.totalBudget) {
          throw new Error(
            "You can't decrease total budget once granting has started"
          );
        }
        event.totalBudget = totalBudget;
      }

      if (grantValue) {
        // granting can't have started to change grant value
        if (grantingHasStarted) {
          throw new Error(
            "You can't change grant value once granting has started"
          );
        }
        event.grantValue = grantValue;
      }

      if (dreamCreationCloses) {
        event.dreamCreationCloses = dreamCreationCloses;
      }

      if (grantingOpens) {
        if (
          !event.totalBudget ||
          !event.grantValue ||
          !event.dreamCreationCloses
        ) {
          throw new Error(
            "You can't set granting opening date before setting total budget, grant value & dream creation close date"
          );
        }

        if (dayjs(grantingOpens).isBefore(dayjs(event.dreamCreationCloses))) {
          throw new Error(
            'Granting opens date needs to be after dream creation closing date'
          );
        }

        event.grantingOpens = grantingOpens;
      }

      if (grantingCloses) {
        if (
          !event.grantingOpens ||
          dayjs(grantingCloses).isBefore(dayjs(event.grantingOpens))
        ) {
          throw new Error(
            "You can't set granting close date before opening date"
          );
        }
        event.grantingCloses = grantingCloses;
      }

      return event.save();
    },
    toggleFavorite: async (
      parent,
      { dreamId },
      { currentMember, models: { Dream } }
    ) => {
      if (!currentMember)
        throw new Error('You need to be logged in to favorite something.');

      const dream = await Dream.findOne({
        _id: dreamId,
        eventId: currentMember.eventId
      });

      if (currentMember.favorites.includes(dreamId)) {
        currentMember.favorites = currentMember.favorites.filter(
          favoriteId => favoriteId != dreamId
        );
        await currentMember.save();
      } else {
        currentMember.favorites.push(dreamId);
        await currentMember.save();
      }

      return dream;
    }
  },
  Member: {
    event: async (member, args, { models: { Event } }) => {
      return Event.findOne({ _id: member.eventId });
    },
    availableGrants: async (member, args, { models: { Grant, Event } }) => {
      if (!member.isApproved) return 0;

      const event = await Event.findOne({
        _id: member.eventId
      });

      const [
        { grantsFromMember } = { grantsFromMember: 0 }
      ] = await Grant.aggregate([
        {
          $match: {
            memberId: mongoose.Types.ObjectId(member.id),
            type: 'USER'
          }
        },
        { $group: { _id: null, grantsFromMember: { $sum: '$value' } } }
      ]);

      if (!event.grantingIsOpen) return 0;

      return event.grantsPerMember - grantsFromMember;
    },
    givenGrants: async (member, args, { models: { Grant } }) => {
      return Grant.find({ memberId: member.id });
    }
  },
  Event: {
    members: async (event, args, { models: { Member } }) => {
      return Member.find({ eventId: event.id });
    },
    dreams: async (event, args, { models: { Dream } }) => {
      return Dream.find({ eventId: event.id });
    },
    numberOfApprovedMembers: async (event, args, { models: { Member } }) => {
      return Member.countDocuments({ eventId: event.id, isApproved: true });
    },
    totalBudgetGrants: async event => {
      return Math.floor(event.totalBudget / event.grantValue);
    },
    remainingGrants: async (event, args, { models: { Grant } }) => {
      const [
        { grantsFromEverybody } = { grantsFromEverybody: 0 }
      ] = await Grant.aggregate([
        {
          $match: {
            eventId: mongoose.Types.ObjectId(event.id),
            reclaimed: false
          }
        },
        { $group: { _id: null, grantsFromEverybody: { $sum: '$value' } } }
      ]);
      return (
        Math.floor(event.totalBudget / event.grantValue) - grantsFromEverybody
      );
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
      const [
        { grantsForDream } = { grantsForDream: 0 }
      ] = await Grant.aggregate([
        {
          $match: {
            dreamId: mongoose.Types.ObjectId(dream.id),
            reclaimed: false
          }
        },
        { $group: { _id: null, grantsForDream: { $sum: '$value' } } }
      ]);
      return grantsForDream;
    },
    numberOfComments: dream => {
      return dream.comments.length;
    },
    favorite: async (dream, args, { currentMember, models: { Favorite } }) => {
      if (!currentMember) return false;

      return currentMember.favorites.includes(dream.id);
    }
  },
  Grant: {
    dream: async (grant, args, { models: { Dream } }) => {
      return Dream.findOne({ _id: grant.dreamId });
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    }
  }),
  Comment: {
    author: async (comment, args, { models: { Member } }) => {
      return Member.findOne({ _id: comment.authorId });
    }
  }
};

module.exports = resolvers;
