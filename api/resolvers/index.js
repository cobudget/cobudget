const slugify = require("../utils/slugify");
const { GraphQLScalarType } = require("graphql");
const GraphQLJSON = require("graphql-type-json");
const { GraphQLJSONObject } = require("graphql-type-json");
const { Kind } = require("graphql/language");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const { combineResolvers, skip } = require("graphql-resolvers");
const KCRequiredActionAlias = require("keycloak-admin").requiredAction;
const discourse = require("../lib/discourse");

const isRootAdmin = (parent, args, { currentUser }) => {
  // TODO: this is old code that doesn't really work right now
  return currentUser && currentUser.isRootAdmin
    ? skip
    : new Error("You need to be root admin");
};

const isMemberOfOrg = (parent, { id }, { kauth, currentOrgMember }) => {
  if (!kauth) throw new Error("You need to be logged in");
  if (!currentOrgMember.organizationId == id && !kauth.isRootAdmin)
    throw new Error("You need to be a member of that organization");
  return skip;
};

// const canEditEvent = (parent, args, { currentOrgMember, models }) => {
//   // args: eventId
//   //and you are either a orgAdmin or eventAdmin..
// };

// const canEditDream = (parent, args, { currentOrgMember, models }) => {
//   // args: eventId
//   //and you are either a orgAdmin or eventAdmin..
// };

// const canEditOrg = (parent, args, { currentOrgMember, currentUser }) => {};

const resolvers = {
  Query: {
    currentUser: (parent, args, { kauth }) => (kauth ? { ...kauth } : null),
    currentOrg: (parent, args, { currentOrg }) => currentOrg,
    currentOrgMember: (parent, args, { currentOrgMember }) => currentOrgMember,
    organization: combineResolvers(
      isMemberOfOrg,
      async (parent, { id }, { models: { Organization } }) => {
        return Organization.findOne({ _id: id });
      }
    ),
    organizations: combineResolvers(
      isRootAdmin,
      async (parent, args, { models: { Organization } }) => {
        return Organization.find();
      }
    ),
    events: async (parent, { limit }, { currentOrg, models: { Event } }) => {
      if (!currentOrg) {
        throw new Error("No organization found");
      }
      return Event.find({ organizationId: currentOrg.id }, null, { limit });
    },
    event: async (parent, { slug }, { currentOrg, models: { Event } }) => {
      if (!currentOrg) return null;
      return Event.findOne({ slug, organizationId: currentOrg.id });
    },
    dream: async (parent, { id }, { models: { Dream } }) => {
      return Dream.findOne({ _id: id });
    },
    dreams: async (
      parent,
      { eventId, textSearchTerm },
      { currentOrgMember, models: { Dream, EventMember } }
    ) => {
      let currentEventMember;
      if (currentOrgMember) {
        currentEventMember = await EventMember.findOne({
          orgMemberId: currentOrgMember.id,
          eventId,
        });
      }

      // if admin or guide, show all dreams (published or unpublished)
      if (
        currentEventMember &&
        (currentEventMember.isAdmin || currentEventMember.isGuide)
      ) {
        return Dream.find({
          eventId,
          ...(textSearchTerm && { $text: { $search: textSearchTerm } }),
        });
      }

      // todo: create appropriate index for this query
      // if event member, show dreams that are publisehd AND dreams where member is cocreator
      if (currentEventMember) {
        return Dream.find({
          eventId,
          $or: [{ published: true }, { cocreators: currentEventMember.id }],
          ...(textSearchTerm && { $text: { $search: textSearchTerm } }),
        });
      }

      return Dream.find({
        eventId,
        published: true,
        ...(textSearchTerm && { $text: { $search: textSearchTerm } }),
      });
    },
    orgMembers: async (
      parent,
      { limit },
      { currentOrg, currentOrgMember, models: { OrgMember } }
    ) => {
      if (!currentOrg) return null;
      if (!currentOrgMember?.isOrgAdmin)
        throw new Error("You need to be org admin to view this");

      return OrgMember.find(
        {
          organizationId: currentOrg.id,
        },
        null,
        { limit }
      );
    },
    members: async (
      parent,
      { eventId, isApproved },
      { currentOrgMember, models: { EventMember, Event } }
    ) => {
      if (!currentOrgMember)
        throw new Error("You need to be a member of this org");

      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({ _id: eventId });

      if (
        currentOrgMember.organizationId.toString() !==
        event.organizationId.toString()
      )
        throw new Error("Wrong org..");

      if (
        !(
          (currentEventMember && currentEventMember.isApproved) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error(
          "You need to be approved member of this event or org admin to view EventMembers"
        );

      return EventMember.find({
        eventId,
        ...(typeof isApproved === "boolean" && { isApproved }),
      });
    },
  },
  Mutation: {
    createOrganization: async (
      parent,
      { name, subdomain: dirtySubdomain, logo },
      { kauth, kcAdminClient, models: { Organization, OrgMember } }
    ) => {
      if (!kauth) throw new Error("You need to be logged in!");
      const subdomain = slugify(dirtySubdomain);

      const organization = new Organization({
        name,
        subdomain,
        logo,
      });

      const orgMember = new OrgMember({
        userId: kauth.sub,
        organizationId: organization.id,
        isOrgAdmin: true,
      });

      const [savedOrg] = await Promise.all([
        organization.save(),
        orgMember.save(),
      ]);

      const clientId = "dreams";

      const [client] = await kcAdminClient.clients.findOne({
        clientId,
      });

      if (client.redirectUris) {
        const newRedirectUris = [
          ...client.redirectUris,
          `https://${subdomain}.dreams.wtf/*`,
        ];

        await kcAdminClient.clients.update(
          { id: client.id },
          {
            clientId,
            redirectUris: newRedirectUris,
          }
        );
      }

      return savedOrg;
    },
    editOrganization: async (
      parent,
      { organizationId, name, subdomain: dirtySubdomain, logo },
      { currentUser, kcAdminClient, currentOrgMember, models: { Organization } }
    ) => {
      if (!(currentOrgMember && currentOrgMember.isOrgAdmin))
        throw new Error("You need to be logged in as organization admin.");
      if (
        organizationId !== currentOrgMember.organizationId.toString() &&
        !currentUser?.isRootAdmin
      )
        throw new Error("You are not a member of this organization.");

      const subdomain = slugify(dirtySubdomain);

      const organization = await Organization.findOne({
        _id: organizationId,
      });

      const isUpdatingRedirectUris = subdomain !== organization.subdomain;
      let newRedirectUris;

      const clientId = "dreams";

      const [client] = await kcAdminClient.clients.findOne({
        clientId,
      });

      if (isUpdatingRedirectUris) {
        const { redirectUris } = client;

        const oldRedirectUri = `https://${organization.subdomain}.dreams.wtf/*`;

        newRedirectUris = [
          ...redirectUris.filter((uri) => uri !== oldRedirectUri),
          `https://${subdomain}.dreams.wtf/*`,
        ];
      }

      organization.name = name;
      organization.logo = logo;
      organization.subdomain = subdomain;
      // organization.customDomain = customDomain;

      await organization.save();

      if (isUpdatingRedirectUris)
        await kcAdminClient.clients.update(
          { id: client.id },
          {
            clientId,
            redirectUris: newRedirectUris,
          }
        );

      return organization;
    },
    setTodosFinished: async (
      parent,
      args,
      { currentOrg, currentOrgMember }
    ) => {
      if (!(currentOrgMember && currentOrgMember.isOrgAdmin))
        throw new Error("You need to be logged in as organization admin.");

      currentOrg.finishedTodos = true;
      await currentOrg.save();

      return currentOrg;
    },
    createEvent: async (
      parent,
      { slug, title, description, summary, currency, registrationPolicy },
      { currentOrgMember, currentOrg, models: { Event, EventMember } }
    ) => {
      if (!(currentOrgMember && currentOrgMember.isOrgAdmin))
        throw new Error("You need to be logged in as organisation admin.");

      const event = await new Event({
        slug,
        title,
        description,
        summary,
        currency,
        registrationPolicy,
        organizationId: currentOrg.id,
      }).save();

      await new EventMember({
        orgMemberId: currentOrgMember.id,
        eventId: event.id,
        isAdmin: true,
        isApproved: true,
      }).save();

      return event;
    },
    editEvent: async (
      parent,
      {
        eventId,
        slug,
        title,
        registrationPolicy,
        info,
        color,
        about,
        dreamReviewIsOpen,
      },
      { currentUser, currentOrgMember, models: { Event, EventMember } }
    ) => {
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });
      if (!event)
        throw new Error("Can't find event in your organization to edit");

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin of this event.");

      if (slug) event.slug = slugify(slug);
      if (title) event.title = title;
      if (registrationPolicy) event.registrationPolicy = registrationPolicy;
      if (typeof info !== "undefined") event.info = info;
      if (typeof about !== "undefined") event.about = about;
      if (color) event.color = color;
      if (typeof dreamReviewIsOpen !== "undefined")
        event.dreamReviewIsOpen = dreamReviewIsOpen;

      return event.save();
    },
    deleteEvent: async (
      parent,
      { eventId },
      { currentOrgMember, models: { Event, Grant, Dream, EventMember } }
    ) => {
      if (!(currentOrgMember && currentOrgMember.isOrgAdmin))
        throw new Error("You need to be org. admin to delete event");

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });

      if (!event)
        throw new Error("Can't find event in your organization to delete.");

      await Grant.deleteMany({ eventId });
      await Dream.deleteMany({ eventId });
      await EventMember.deleteMany({ eventId });
      return event.remove();
    },
    addGuideline: async (
      parent,
      { eventId, guideline },
      { currentOrgMember, models: { Event, EventMember } }
    ) => {
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });

      if (!event)
        throw new Error("Can't find event in your organization to delete.");

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin to add a guideline");

      event.guidelines.push({ ...guideline });

      return event.save();
    },
    editGuideline: async (
      parent,
      { eventId, guidelineId, guideline },
      { currentOrgMember, models: { Event, EventMember } }
    ) => {
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });

      if (!event)
        throw new Error("Can't find event in your organization to edit.");

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin to edit a guideline");

      let doc = event.guidelines.id(guidelineId);

      doc.title = guideline.title;
      doc.description = guideline.description;

      return event.save();
    },
    setGuidelinePosition: async (
      parent,
      { eventId, guidelineId, newPosition },
      { currentOrgMember, models: { Event, EventMember } }
    ) => {
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });

      if (!event)
        throw new Error("Can't find event in your organization to edit.");

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin to edit a guideline");

      let doc = event.guidelines.id(guidelineId);
      doc.position = newPosition;
      return event.save();
    },
    deleteGuideline: async (
      parent,
      { eventId, guidelineId },
      { currentOrgMember, models: { Event, EventMember } }
    ) => {
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });

      if (!event)
        throw new Error("Can't find event in your organization to edit.");

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin to remove a guideline");

      let doc = event.guidelines.id(guidelineId);
      doc.remove();

      return event.save();
    },
    addCustomField: async (
      parent,
      { eventId, customField },
      { currentOrgMember, models: { EventMember, Event } }
    ) => {
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });

      if (!event)
        throw new Error("Can't find event in your organization to edit.");

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin to add a custom field");

      event.customFields.push({ ...customField });

      return event.save();
    },
    // Based on https://softwareengineering.stackexchange.com/a/195317/54663
    setCustomFieldPosition: async (
      parent,
      { eventId, fieldId, newPosition },
      { currentOrgMember, models: { EventMember, Event } }
    ) => {
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });

      if (!event)
        throw new Error("Can't find event in your organization to edit.");

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin to edit a custom field");

      let doc = event.customFields.id(fieldId);
      doc.position = newPosition;
      return event.save();
    },
    editCustomField: async (
      parent,
      { eventId, fieldId, customField },
      { currentOrgMember, models: { EventMember, Event } }
    ) => {
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });

      if (!event)
        throw new Error("Can't find event in your organization to edit.");

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin to edit a custom field");

      let doc = event.customFields.id(fieldId);
      // doc = { ...doc, ...customField };
      doc.name = customField.name;
      doc.type = customField.type;
      doc.description = customField.description;
      doc.isRequired = customField.isRequired;
      doc.isShownOnFrontPage = customField.isShownOnFrontPage;

      return event.save();
    },
    deleteCustomField: async (
      parent,
      { eventId, fieldId },
      { currentOrgMember, models: { EventMember, Event } }
    ) => {
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });

      if (!event)
        throw new Error("Can't find event in your organization to edit.");

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin to delete a custom field");

      let doc = event.customFields.id(fieldId);
      doc.remove();

      return event.save();
    },
    createDream: async (
      parent,
      {
        eventId,
        title,
        description,
        summary,
        budgetDescription,
        minGoal,
        maxGoal,
        images,
        budgetItems,
      },
      { currentOrgMember, currentOrg, models: { EventMember, Dream, Event } }
    ) => {
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      if (!eventMember || !eventMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      const event = await Event.findOne({ _id: eventId });

      if (!event.dreamCreationIsOpen)
        throw new Error("Dream creation is not open");

      // // if maxGoal is defined, it needs to be larger than minGoal, that also needs to be defined
      // if (maxGoal && (maxGoal <= minGoal || minGoal == null))
      //   throw new Error('max goal needs to be larger than min goal');
      const dream = new Dream({
        eventId,
        title,
        cocreators: [eventMember.id],
      });

      if (currentOrg.discourse) {
        const discoursePost = await discourse(
          currentOrg.discourse
        ).posts.create(
          {
            title,
            raw: `https://${
              currentOrg.customDomain
                ? currentOrg.customDomain
                : `${currentOrg.subdomain}.${process.env.DEPLOY_URL}`
            }/${event.slug}/${dream.id}`,
            ...(currentOrg.discourse.dreamsCategoryId && {
              category: currentOrg.discourse.dreamsCategoryId,
            }),
          },
          { username: "system" }
        );

        dream.discourseTopicId = discoursePost.topic_id;
      }

      return dream.save();
    },
    editDream: async (
      parent,
      { dreamId, title, description, summary, images, budgetItems },
      { currentOrgMember, models: { EventMember, Dream } }
    ) => {
      const dream = await Dream.findOne({ _id: dreamId });

      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (
        !eventMember ||
        (!dream.cocreators.includes(eventMember.id) &&
          !eventMember.isAdmin &&
          !eventMember.isGuide)
      )
        throw new Error("You are not a cocreator of this dream.");

      if (title) dream.title = title;
      if (typeof description !== "undefined") dream.description = description;
      if (typeof summary !== "undefined") dream.summary = summary;
      if (typeof images !== "undefined") dream.images = images;
      if (typeof budgetItems !== "undefined") dream.budgetItems = budgetItems;

      return dream.save();
    },
    editDreamCustomField: async (
      parent,
      { dreamId, customField },
      { currentOrgMember, models: { EventMember, Dream } }
    ) => {
      const dream = await Dream.findOne({ _id: dreamId });

      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (
        !eventMember ||
        (!dream.cocreators.includes(eventMember.id) &&
          !eventMember.isAdmin &&
          !eventMember.isGuide)
      )
        throw new Error("You are not a cocreator of this dream.");

      const existingField = dream.customFields.filter((field) => {
        return field.fieldId == customField.fieldId;
      });

      if (existingField.length > 0) {
        existingField[0].value = customField.value;
      } else {
        dream.customFields.push(customField);
      }

      return dream.save();
    },
    deleteDream: async (
      parent,
      { dreamId },
      { currentOrgMember, models: { Dream, EventMember, Grant } }
    ) => {
      const dream = await Dream.findOne({ _id: dreamId });

      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (
        !eventMember ||
        (!dream.cocreators.includes(eventMember.id) &&
          !eventMember.isAdmin &&
          !eventMember.isGuide)
      )
        throw new Error("You are not a cocreator of this dream.");

      const [
        { grantsForDream } = { grantsForDream: 0 },
      ] = await Grant.aggregate([
        { $match: { dreamId: mongoose.Types.ObjectId(dreamId) } },
        { $group: { _id: null, grantsForDream: { $sum: "$value" } } },
      ]);

      if (grantsForDream > 0) {
        throw new Error("You cant delete a Dream that has received tokens");
      }

      return dream.remove();
    },
    addCocreator: async (
      parent,
      { dreamId, memberId },
      { currentOrgMember, models: { EventMember, Dream } }
    ) => {
      const dream = await Dream.findOne({ _id: dreamId });

      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (
        !eventMember ||
        (!dream.cocreators.includes(eventMember.id) &&
          !eventMember.isAdmin &&
          !eventMember.isGuide)
      )
        throw new Error("You are not a cocreator of this dream.");

      // check that added memberId is not already part of the thing
      if (dream.cocreators.includes(memberId))
        throw new Error("Member is already cocreator of dream");

      // check that memberId is a member of event
      const member = await EventMember.findOne({
        _id: memberId,
        eventId: dream.eventId,
      });
      if (!member) throw new Error("No member found with this id");

      dream.cocreators.push(memberId);

      return dream.save();
    },
    removeCocreator: async (
      parent,
      { dreamId, memberId },
      { currentOrgMember, models: { EventMember, Dream } }
    ) => {
      const dream = await Dream.findOne({ _id: dreamId });

      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (
        !eventMember.isAdmin &&
        !eventMember.isGuide &&
        !dream.cocreators.includes(eventMember.id)
      )
        throw new Error("You need to be a cocreator to remove co-creators.");

      // check that added memberId is not already part of the thing
      if (!dream.cocreators.includes(memberId))
        throw new Error("Member is not a co-creator of this dream.");

      // can't remove last person
      if (dream.cocreators.length === 1)
        throw new Error("Can't remove last co-creator.");

      dream.cocreators = dream.cocreators.filter(
        (id) => id.toString() !== memberId
      );

      return dream.save();
    },
    publishDream: async (
      parent,
      { dreamId, unpublish },
      { currentOrgMember, models: { EventMember, Dream } }
    ) => {
      const dream = await Dream.findOne({ _id: dreamId });

      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (
        !eventMember ||
        (!dream.cocreators.includes(eventMember.id) &&
          !eventMember.isAdmin &&
          !eventMember.isGuide)
      )
        throw new Error("You are not a cocreator of this dream.");

      dream.published = !unpublish;

      return dream.save();
    },
    addComment: async (
      parent,
      { content, dreamId },
      { currentOrg, currentOrgMember, models: { Dream, Event } }
    ) => {
      const dream = await Dream.findOne({
        _id: dreamId,
      });

      if (!currentOrgMember)
        throw new Error("You need to be an org member to post comments.");

      if (currentOrg.discourse) {
        if (!currentOrgMember.discourseApiKey) {
          throw new Error(
            "You need to have a discourse account connected, go to /connect-discourse"
          );
        }

        if (content.length < 20)
          throw new Error("Your post needs to be at least 20 characters long");

        if (!dream.discourseTopicId) {
          const event = await Event.findOne({ _id: dream.eventId });

          const discoursePost = await discourse(
            currentOrg.discourse
          ).posts.create(
            {
              title: dream.title,
              raw: `https://${
                currentOrg.customDomain
                  ? currentOrg.customDomain
                  : `${currentOrg.subdomain}.${process.env.DEPLOY_URL}`
              }/${event.slug}/${dream.id}`,

              ...(currentOrg.discourse.dreamsCategoryId && {
                category: currentOrg.discourse.dreamsCategoryId,
              }),
            },
            { username: "system" }
          );

          dream.discourseTopicId = discoursePost.topic_id;
        }

        // TODO: error handling (expired api key, faulty discourse url)
        await discourse(currentOrg.discourse).posts.create(
          {
            topic_id: dream.discourseTopicId,
            raw: content,
          },
          { userApiKey: currentOrgMember.discourseApiKey }
        );

        return dream.save();
      }

      // post regular comment
      if (content.length < 3)
        throw new Error("Your post needs to be at least 3 characters long!");

      dream.comments.push({
        authorId: currentOrgMember.id,
        content,
      });

      return dream.save();
    },

    deleteComment: async (
      parent,
      { dreamId, commentId },
      { currentOrg, currentOrgMember, models: { EventMember, Dream } }
    ) => {
      const dream = await Dream.findOne({
        _id: dreamId,
      });

      if (!currentOrgMember) {
        throw new Error("You need to be member of the org to delete comments");
      }

      if (currentOrg.discourse) {
        const post = await discourse(currentOrg.discourse).posts.getSingle(
          commentId
        );

        if (
          post.username !== currentOrgMember.discourseUsername ||
          !currentOrgMember.isOrgAdmin
        ) {
          throw new Error(
            "You can only delete your own post. If this is your post, re-connect to discourse on /connect-discourse"
          );
        }

        await discourse(currentOrg.discourse).posts.delete({
          id: commentId,
          ...(post.username == currentOrgMember.discourseUsername && {
            userApiKey: currentOrgMember.discourseApiKey,
          }),
          ...(post.username !== currentOrgMember.discourseUsername &&
            currentOrgMember.isOrgAdmin && { username: "system" }),
        });
        return dream;
      }

      // mongodb comments
      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      dream.comments = dream.comments.filter(
        (comment) =>
          !(
            comment._id.toString() === commentId &&
            (comment.authorId.toString() === currentOrgMember.id.toString() ||
              eventMember?.isAdmin)
          )
      );

      return dream.save();
    },
    editComment: async (
      parent,
      { dreamId, commentId, content },
      { currentOrgMember, models: { EventMember, Dream } }
    ) => {
      const dream = await Dream.findOne({
        _id: dreamId,
      });

      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      const comment = dream.comments.filter(
        (comment) =>
          comment._id.toString() === commentId &&
          (comment.authorId.toString() === currentOrgMember.id.toString() ||
            eventMember?.isAdmin)
      );

      if (comment.length == 0) {
        throw new Error(
          "Cant find that comment - Does this comment belongs to you?"
        );
      }
      comment[0].content = content;
      comment[0].updatedAt = new Date();

      return dream.save();
    },
    raiseFlag: async (
      parent,
      { dreamId, guidelineId, comment },
      { currentOrg, currentOrgMember, models: { Dream, Event, EventMember } }
    ) => {
      // check dreamReviewIsOpen
      // check not already left a flag?

      const dream = await Dream.findOne({
        _id: dreamId,
      });

      const event = await Event.findOne({ _id: dream.eventId });

      const guideline = event.guidelines.id(guidelineId);

      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (!eventMember || !eventMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      dream.flags.push({
        guidelineId,
        comment,
        type: "RAISE_FLAG",
        userId: currentOrgMember.id,
      });

      const logContent = `Someone flagged this dream for the **${guideline.title}** guideline: \n> ${comment}`;

      if (currentOrg.discourse) {
        if (!dream.discourseTopicId) {
          // TODO: break out create thread into separate function
          const discoursePost = await discourse(
            currentOrg.discourse
          ).posts.create(
            {
              title,
              raw: `https://${
                currentOrg.customDomain
                  ? currentOrg.customDomain
                  : `${currentOrg.subdomain}.${process.env.DEPLOY_URL}`
              }/${event.slug}/${dream.id}`,
              ...(currentOrg.discourse.dreamsCategoryId && {
                category: currentOrg.discourse.dreamsCategoryId,
              }),
            },
            {
              username: "system",
            }
          );

          dream.discourseTopicId = discoursePost.topic_id;
        }

        await discourse(currentOrg.discourse).posts.create(
          {
            topic_id: dream.discourseTopicId,
            raw: logContent,
          },
          { username: "system" }
        );
      } else {
        dream.comments.push({
          authorId: currentOrgMember.id,
          content: logContent,
          isLog: true,
        });
      }

      return dream.save();
    },
    resolveFlag: async (
      parent,
      { dreamId, flagId, comment },
      { currentOrg, currentOrgMember, models: { Dream, Event, EventMember } }
    ) => {
      // check dreamReviewIsOpen
      // check not already left a flag?

      const dream = await Dream.findOne({
        _id: dreamId,
      });

      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (!eventMember || !eventMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      dream.flags.push({
        resolvingFlagId: flagId,
        comment,
        type: "RESOLVE_FLAG",
        userId: currentOrgMember.id,
      });

      const resolvedFlag = dream.flags.id(flagId);

      const event = await Event.findOne({ _id: dream.eventId });

      const guideline = event.guidelines.id(resolvedFlag.guidelineId);

      const logContent = `Someone resolved a flag for the **${guideline.title}** guideline: \n> ${comment}`;

      if (currentOrg.discourse) {
        if (!dream.discourseTopicId) {
          // TODO: break out create thread into separate function
          const discoursePost = await discourse(
            currentOrg.discourse
          ).posts.create(
            {
              title,
              raw: `https://${
                currentOrg.customDomain
                  ? currentOrg.customDomain
                  : `${currentOrg.subdomain}.${process.env.DEPLOY_URL}`
              }/${event.slug}/${dream.id}`,
              ...(currentOrg.discourse.dreamsCategoryId && {
                category: currentOrg.discourse.dreamsCategoryId,
              }),
            },
            {
              username: "system",
            }
          );

          dream.discourseTopicId = discoursePost.topic_id;
        }
        await discourse(currentOrg.discourse).posts.create(
          {
            topic_id: dream.discourseTopicId,
            raw: logContent,
          },
          { username: "system" }
        );
      } else {
        dream.comments.push({
          authorId: currentOrgMember.id,
          content: logContent,
          isLog: true,
        });
      }

      return dream.save();
    },
    allGoodFlag: async (
      parent,
      { dreamId },
      { currentOrgMember, models: { Dream, EventMember } }
    ) => {
      // check dreamReviewIsOpen
      // check have not left one of these flags already
      const dream = await Dream.findOne({
        _id: dreamId,
      });

      const eventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (!eventMember || !eventMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      for (flag in dream.flags) {
        if (
          flag.userId === currentOrgMember.id &&
          flag.type === "ALL_GOOD_FLAG"
        )
          throw new Error("You have already left an all good flag");
      }

      dream.flags.push({
        type: "ALL_GOOD_FLAG",
        userId: currentOrgMember.id,
      });

      return dream.save();
    },

    joinOrg: async (
      parent,
      args,
      { kauth, currentOrg, models: { OrgMember } }
    ) => {
      if (!kauth) throw new Error("You need to be logged in.");

      return new OrgMember({
        userId: kauth.sub,
        organizationId: currentOrg.id,
      }).save();
    },
    updateProfile: async (
      parent,
      { firstName, lastName, username, bio },
      { kauth, currentOrgMember, kcAdminClient }
    ) => {
      if (!kauth) throw new Error("You need to be logged in..");

      if (firstName || lastName || username) {
        try {
          await kcAdminClient.users.update(
            { id: kauth.sub },
            {
              ...(typeof firstName !== "undefined" && { firstName }),
              ...(typeof lastName !== "undefined" && { lastName }),
              ...(typeof username !== "undefined" && { username }),
            }
          );
        } catch (error) {
          throw new Error(error);
        }
      }

      if (currentOrgMember && bio) {
        currentOrgMember.bio = bio;
        await currentOrgMember.save();
      }

      return kcAdminClient.users.findOne({ id: kauth.sub });
    },
    inviteEventMembers: async (
      parent,
      { emails: emailsString, eventId },
      {
        currentOrgMember,
        currentOrg,
        kcAdminClient,
        models: { OrgMember, EventMember, Event },
      }
    ) => {
      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({ _id: eventId });

      if (!currentEventMember || !currentEventMember.isAdmin)
        throw new Error("You need to be admin to invite new members");

      const emails = emailsString.split(",");

      if (emails.length > 1000)
        throw new Error("You can only invite 1000 people at a time");

      // let newOrgMembers = [];
      const newEventMembers = [];

      for (email of emails) {
        const [user] = await kcAdminClient.users.findOne({
          email: email.trim(),
        });

        if (user) {
          const orgMember = await OrgMember.findOne({ userId: user.id });
          if (orgMember) {
            const eventMember = await EventMember.findOne({
              orgMemberId: orgMember.id,
              eventId,
            });
            if (eventMember) {
              eventMember.isApproved = true;
              await eventMember.save();
            } else {
              newEventMembers.push(
                await new EventMember({
                  orgMemberId: orgMember.id,
                  eventId,
                  isApproved: true,
                }).save()
              );
            }
          } else {
            const orgMember = await new OrgMember({
              userId: user.id,
              organizationId: currentOrgMember.organizationId,
            }).save();

            newEventMembers.push(
              await new EventMember({
                orgMemberId: orgMember.id,
                eventId,
                isApproved: true,
              }).save()
            );
          }
        } else {
          const user = await kcAdminClient.users.create({
            username: email.trim(),
            email: email.trim(),
            requiredActions: [
              KCRequiredActionAlias.UPDATE_PROFILE,
              KCRequiredActionAlias.UPDATE_PASSWORD,
            ],
            enabled: true,
          });

          await kcAdminClient.users.executeActionsEmail({
            id: user.id,
            lifespan: 60 * 60 * 24 * 90,
            actions: [
              KCRequiredActionAlias.UPDATE_PROFILE,
              KCRequiredActionAlias.UPDATE_PASSWORD,
            ],
            clientId: "dreams",
            redirectUri: `${
              process.env.NODE_ENV === "production" ? "https" : "http"
            }://${
              currentOrg.customDomain
                ? currentOrg.customDomain
                : `${currentOrg.subdomain}.${process.env.DEPLOY_URL}`
            }/${event.slug}`,
          });

          const orgMember = await new OrgMember({
            userId: user.id,
            organizationId: currentOrgMember.organizationId,
          }).save();

          newEventMembers.push(
            await new EventMember({
              orgMemberId: orgMember.id,
              eventId,
              isApproved: true,
            }).save()
          );
        }
      }
      return newEventMembers;
    },
    inviteOrgMembers: async (
      parent,
      { emails: emailsString },
      { currentOrgMember, currentOrg, kcAdminClient, models: { OrgMember } }
    ) => {
      if (!currentOrgMember?.isOrgAdmin)
        throw new Error("You need to be org. admin to invite members.");

      const emails = emailsString.split(",");

      if (emails.length > 1000)
        throw new Error("You can only invite 1000 people at a time");

      let newOrgMembers = [];

      for (email of emails) {
        const [user] = await kcAdminClient.users.findOne({
          email: email.trim(),
        });
        if (user) {
          const orgMember = await OrgMember.findOne({ userId: user.id });
          if (!orgMember) {
            newOrgMembers.push(
              await new OrgMember({
                userId: user.id,
                organizationId: currentOrgMember.organizationId,
              }).save()
            );
          }
        } else {
          const user = await kcAdminClient.users.create({
            username: email.trim(),
            email: email.trim(),
            requiredActions: [
              KCRequiredActionAlias.UPDATE_PROFILE,
              KCRequiredActionAlias.UPDATE_PASSWORD,
            ],
            enabled: true,
          });

          await kcAdminClient.users.executeActionsEmail({
            id: user.id,
            lifespan: 60 * 60 * 24 * 90,
            actions: [
              KCRequiredActionAlias.UPDATE_PROFILE,
              KCRequiredActionAlias.UPDATE_PASSWORD,
            ],
            clientId: "dreams",
            redirectUri: `${
              process.env.NODE_ENV === "production" ? "https" : "http"
            }://${
              currentOrg.customDomain
                ? currentOrg.customDomain
                : `${currentOrg.subdomain}.${process.env.DEPLOY_URL}`
            }/`,
          });

          newOrgMembers.push(
            await new OrgMember({
              userId: user.id,
              organizationId: currentOrgMember.organizationId,
            }).save()
          );
        }
      }

      return newOrgMembers;
    },
    updateOrgMember: async (
      parent,
      { memberId, isOrgAdmin },
      { currentOrg, currentOrgMember, models: { OrgMember } }
    ) => {
      if (!currentOrgMember?.isOrgAdmin)
        throw new Error("You need to be org admin to update member");

      const orgMember = await OrgMember.findOne({
        _id: memberId,
        organizationId: currentOrg.id,
      });

      if (!orgMember) throw new Error("No member to update found");

      if (typeof isOrgAdmin !== "undefined") {
        if (isOrgAdmin === false) {
          const orgAdmins = await OrgMember.find({
            organizationId: currentOrg.id,
            isOrgAdmin: true,
          });
          if (orgAdmins.length <= 1)
            throw new Error("You need at least 1 org admin");
        }
        orgMember.isOrgAdmin = isOrgAdmin;
      }
      return orgMember.save();
    },
    updateMember: async (
      parent,
      { eventId, memberId, isApproved, isAdmin, isGuide },
      { currentOrgMember, models: { EventMember } }
    ) => {
      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      if (
        !(
          (currentEventMember && currentEventMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to update member");

      const member = await EventMember.findOne({
        _id: memberId,
        eventId,
      });

      if (!member) throw new Error("No member to update found");

      if (typeof isApproved !== "undefined") {
        member.isApproved = isApproved;
      } // send notification on approving?
      if (typeof isAdmin !== "undefined") {
        member.isAdmin = isAdmin;
      }
      if (typeof isGuide !== "undefined") {
        member.isGuide = isGuide;
      }
      return member.save();
    },
    deleteMember: async (
      parent,
      { eventId, memberId },
      { currentOrgMember, models: { EventMember } }
    ) => {
      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      if (
        !(
          (currentEventMember && currentEventMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to delete member");

      const member = await EventMember.findOneAndDelete({
        _id: memberId,
        eventId,
      });

      return member;
    },
    deleteOrganization: async (
      parent,
      { organizationId },
      { currentUser, currentOrgMember, models: { Organization } }
    ) => {
      if (
        !(
          (currentOrgMember && currentOrgMember.isOrgAdmin) ||
          currentUser.isRootAdmin
        )
      )
        throw new Error(
          "You need to be org. or root admin to delete an organization"
        );

      const organization = await Organization.findOne({
        _id: organizationId,
      });

      if (!organization)
        throw new Error(`Cant find organization by id ${organizationId}`);

      return await Organization.findOneAndDelete({
        _id: organizationId,
      });
    },
    approveForGranting: async (
      parent,
      { dreamId, approved },
      { currentOrgMember, models: { Dream, EventMember } }
    ) => {
      const dream = await Dream.findOne({ _id: dreamId });

      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (
        !currentEventMember ||
        (!currentEventMember.isAdmin && !currentEventMember.isGuide)
      )
        throw new Error(
          "You need to be admin or guide to approve for granting"
        );

      dream.approved = approved;
      return dream.save();
    },
    giveGrant: async (
      parent,
      { eventId, dreamId, value },
      { currentOrgMember, models: { EventMember, Grant, Event, Dream } }
    ) => {
      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      if (!currentEventMember || !currentEventMember.isApproved)
        throw new Error(
          "You need to be a logged in approved member to fund things"
        );

      if (value <= 0) throw new Error("Value needs to be more than zero");

      const event = await Event.findOne({ _id: eventId });

      // Check that granting is open
      if (!event.grantingIsOpen) throw new Error("Granting is not open");

      const dream = await Dream.findOne({ _id: dreamId, eventId });

      if (!dream.approved)
        throw new Error("Dream is not approved for granting");

      // Check that the max goal of the dream is not exceeded
      const [
        { grantsForDream } = { grantsForDream: 0 },
      ] = await Grant.aggregate([
        { $match: { dreamId: mongoose.Types.ObjectId(dreamId) } },
        { $group: { _id: null, grantsForDream: { $sum: "$value" } } },
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
          `You can give a maximum of ${event.maxGrantsToDream} tokens to one dream`
        );
      }

      // Check that user has not spent more tokens than he has
      const [
        { grantsFromUser } = { grantsFromUser: 0 },
      ] = await Grant.aggregate([
        {
          $match: {
            memberId: mongoose.Types.ObjectId(currentEventMember.id),
            type: "USER",
          },
        },
        { $group: { _id: null, grantsFromUser: { $sum: "$value" } } },
      ]);

      if (grantsFromUser + value > event.grantsPerMember)
        throw new Error("You are trying to spend too many tokens.");

      // Check that total budget of event will not be exceeded
      const [
        { grantsFromEverybody } = { grantsFromEverybody: 0 },
      ] = await Grant.aggregate([
        {
          $match: {
            eventId: mongoose.Types.ObjectId(currentEventMember.eventId),
            reclaimed: false,
          },
        },
        { $group: { _id: null, grantsFromEverybody: { $sum: "$value" } } },
      ]);

      const totalGrantsToSpend = Math.floor(
        event.totalBudget / event.grantValue
      );

      if (grantsFromEverybody + value > totalGrantsToSpend)
        throw new Error("Total budget of event is exeeced with this grant");

      return new Grant({
        eventId: currentEventMember.eventId,
        dreamId,
        value,
        memberId: currentEventMember.id,
      }).save();
    },
    deleteGrant: async (
      parent,
      { eventId, grantId },
      { currentOrgMember, models: { Grant, Event, EventMember } }
    ) => {
      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      if (!currentEventMember || !currentEventMember.isApproved)
        throw new Error(
          "You need to be a logged in approved member to remove tokens"
        );

      const event = await Event.findOne({ _id: eventId });

      // Check that granting is open
      if (!event.grantingIsOpen)
        throw new Error("Can't remove granted tokens when granting is closed");

      const grant = await Grant.findOneAndDelete({
        _id: grantId,
        memberId: currentEventMember.id,
      });
      return grant;
    },
    reclaimGrants: async (
      parent,
      { dreamId },
      { currentOrgMember, models: { Grant, Event, Dream, EventMember } }
    ) => {
      const dream = await Dream.findOne({ _id: dreamId });

      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (!currentEventMember || !currentEventMember.isAdmin)
        throw new Error("You need to be admin to reclaim tokens");

      const event = await Event.findOne({ _id: dream.eventId });

      // Granting needs to be closed before you can reclaim tokens
      if (!event.grantingHasClosed)
        throw new Error("You can't reclaim tokens before granting has closed");

      // If dream has reached minimum funding, you can't reclaim its tokens
      const [
        { grantsForDream } = { grantsForDream: 0 },
      ] = await Grant.aggregate([
        {
          $match: {
            dreamId: mongoose.Types.ObjectId(dreamId),
            reclaimed: false,
          },
        },
        { $group: { _id: null, grantsForDream: { $sum: "$value" } } },
      ]);

      const minGoalGrants = Math.ceil(dream.minGoal / event.grantValue);

      if (grantsForDream >= minGoalGrants)
        throw new Error(
          "You can't reclaim tokens if it has reached minimum funding"
        );

      await Grant.updateMany({ dreamId }, { reclaimed: true });

      return dream;
    },
    preOrPostFund: async (
      parent,
      { dreamId, value },
      { currentOrgMember, models: { Grant, Dream, Event, EventMember } }
    ) => {
      const dream = await Dream.findOne({ _id: dreamId });

      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (!currentEventMember || !currentEventMember.isAdmin)
        throw new Error("You need to be admin to pre or post fund");

      if (value <= 0) throw new Error("Value needs to be more than zero");

      const event = await Event.findOne({ _id: dream.eventId });

      // TODO: check whether certain settings are set, like grant value and total budget

      if (!dream.approved)
        throw new Error("Dream is not approved for granting");

      // Check that the max goal of the dream is not exceeded
      const [
        { grantsForDream } = { grantsForDream: 0 },
      ] = await Grant.aggregate([
        {
          $match: {
            dreamId: mongoose.Types.ObjectId(dreamId),
            reclaimed: false,
          },
        },
        { $group: { _id: null, grantsForDream: { $sum: "$value" } } },
      ]);

      const maxGoalGrants = Math.ceil(
        Math.max(dream.maxGoal, dream.minGoal) / event.grantValue
      );

      if (grantsForDream + value > maxGoalGrants)
        throw new Error("You can't overfund this dream.");

      // Check that total budget of event will not be exceeded
      const [
        { grantsFromEverybody } = { grantsFromEverybody: 0 },
      ] = await Grant.aggregate([
        {
          $match: {
            eventId: mongoose.Types.ObjectId(dream.eventId),
            reclaimed: false,
          },
        },
        { $group: { _id: null, grantsFromEverybody: { $sum: "$value" } } },
      ]);

      const totalGrantsToSpend = Math.floor(
        event.totalBudget / event.grantValue
      );

      if (grantsFromEverybody + value > totalGrantsToSpend)
        throw new Error("Total budget of event is exeeced with this grant");

      return new Grant({
        eventId: dream.eventId,
        dreamId,
        value,
        type: event.grantingHasClosed ? "POST_FUND" : "PRE_FUND",
        memberId: currentEventMember.id,
      }).save();
    },
    updateGrantingSettings: async (
      parent,
      {
        eventId,
        currency,
        grantsPerMember,
        maxGrantsToDream,
        totalBudget,
        grantValue,
        dreamCreationCloses,
        grantingOpens,
        grantingCloses,
        allowStretchGoals,
      },
      { currentOrgMember, models: { Event, EventMember } }
    ) => {
      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId,
      });

      const event = await Event.findOne({
        _id: eventId,
        organizationId: currentOrgMember.organizationId,
      });

      if (!event)
        throw new Error("Can't find event in your organization to edit");

      if (
        !(
          (currentEventMember && currentEventMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to update granting settings.");

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
        // granting can't have started to change tokens per member
        if (grantingHasStarted) {
          throw new Error(
            "You can't change tokens per member once granting has started"
          );
        }
        event.grantsPerMember = grantsPerMember;
        event.grantValue = undefined;
      }

      if (maxGrantsToDream) {
        if (grantingHasStarted) {
          throw new Error(
            "You can't change max tokens to dream once granting has started"
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
        // granting can't have started to change token value
        if (grantingHasStarted) {
          throw new Error(
            "You can't change token value once granting has started"
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
          !event.grantValue
          // || !event.dreamCreationCloses
        ) {
          throw new Error(
            "You can't set granting opening date before setting total budget & token value "
          );
        }

        // if (dayjs(grantingOpens).isBefore(dayjs(event.dreamCreationCloses))) {
        //   throw new Error(
        //     "Granting opens date needs to be after dream creation closing date"
        //   );
        // }

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

      if (typeof allowStretchGoals !== "undefined") {
        if (grantingHasStarted) {
          throw new Error(
            "You can't change stretch goal setting once granting has started"
          );
        }
        event.allowStretchGoals = allowStretchGoals;
      }

      return event.save();
    },
    toggleFavorite: async (
      parent,
      { dreamId },
      { currentOrgMember, models: { Dream, EventMember } }
    ) => {
      const dream = await Dream.findOne({
        _id: dreamId,
      });

      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });

      if (!currentEventMember)
        throw new Error("You need to be a member to favorite something.");

      if (currentEventMember.favorites.includes(dreamId)) {
        currentEventMember.favorites = currentEventMember.favorites.filter(
          (favoriteId) => favoriteId != dreamId
        );
        await currentEventMember.save();
      } else {
        currentEventMember.favorites.push(dreamId);
        await currentEventMember.save();
      }

      return dream;
    },
    registerForEvent: async (
      parent,
      { eventId },
      {
        kauth,
        currentOrg,
        currentOrgMember,
        models: { EventMember, Event, OrgMember },
      }
    ) => {
      if (!kauth) throw new Error("You need to be logged in.");

      let orgMember = currentOrgMember;

      if (!orgMember) {
        orgMember = await new OrgMember({
          userId: kauth.sub,
          organizationId: currentOrg.id,
        }).save();
      }

      const currentEventMember = await EventMember.findOne({
        orgMemberId: orgMember.id,
        eventId,
      });

      if (currentEventMember) throw new Error("You are already a member");

      const event = await Event.findOne({ _id: eventId });

      let newMember = {
        isAdmin: false,
        eventId,
        orgMemberId: orgMember.id,
      };

      if (orgMember.isOrgAdmin) {
        newMember.isApproved = true;
      } else {
        switch (event.registrationPolicy) {
          case "OPEN":
            newMember.isApproved = true;
            break;
          case "REQUEST_TO_JOIN":
            newMember.isApproved = false;

            // TODO: need to fix this.. no emails saved in orgmembers
            // // send request to join notification emails
            // const admins = await EventMember.find({
            //   eventId,
            //   isAdmin: true,
            // }).populate('orgMemberId');

            // const adminEmails = admins.map((member) => member.orgMemberId.email);
            // await EmailService.sendRequestToJoinNotifications(
            //   currentOrg,
            //   currentUser,
            //   event,
            //   adminEmails
            // );
            break;

          case "INVITE_ONLY":
            throw new Error("This event is invite only");
        }
      }

      return new EventMember(newMember).save();
    },
  },
  EventMember: {
    // user: async (member, args, { models: { User } }) => {
    //   // this one is not existing in the schema.. but should be possible to have. still

    //   return User.findOne({ _id: member.userId });
    // },
    event: async (member, args, { models: { Event } }) => {
      return Event.findOne({ _id: member.eventId });
    },
    orgMember: async (member, args, { models: { OrgMember } }) => {
      return OrgMember.findOne({ _id: member.orgMemberId });
    },
    availableGrants: async (member, args, { models: { Grant, Event } }) => {
      if (!member.isApproved) return 0;

      const event = await Event.findOne({
        _id: member.eventId,
      });

      const [
        { grantsFromMember } = { grantsFromMember: 0 },
      ] = await Grant.aggregate([
        {
          $match: {
            memberId: mongoose.Types.ObjectId(member.id),
            type: "USER",
          },
        },
        { $group: { _id: null, grantsFromMember: { $sum: "$value" } } },
      ]);

      if (!event.grantingIsOpen) return 0;

      return event.grantsPerMember - grantsFromMember;
    },
    givenGrants: async (member, args, { models: { Grant } }) => {
      return Grant.find({ memberId: member.id });
    },
  },
  OrgMember: {
    hasDiscourseApiKey: (orgMember) => !!orgMember.discourseApiKey,
    user: async (orgMember, args, { kcAdminClient }) => {
      const user = await kcAdminClient.users.findOne({
        id: orgMember.userId,
      });
      return user;
    },
    eventMemberships: async (orgMember, args, { models: { EventMember } }) => {
      return EventMember.find({ orgMemberId: orgMember.id });
    },
    currentEventMembership: async (
      orgMember,
      { slug },
      { currentOrgMember, models: { EventMember, Event } }
    ) => {
      if (!slug || !currentOrgMember) return null;
      if (orgMember.id.toString() !== currentOrgMember.id.toString())
        return null;

      const event = await Event.findOne({
        organizationId: currentOrgMember.organizationId,
        slug,
      });

      return EventMember.findOne({
        orgMemberId: orgMember.id,
        eventId: event.id,
      });
    },
  },
  User: {
    currentOrgMember: async (user, args, { currentOrgMember }) => {
      if (!currentOrgMember) return null;
      return user.sub === currentOrgMember.userId ? currentOrgMember : null;
    },
    orgMemberships: async (user, args, { models: { OrgMember } }) => {
      return OrgMember.find({ userId: user.id });
    },
    id: (user) => (user.sub ? user.sub : user.id),
    username: (user) =>
      user.username ? user.username : user.preferred_username,
    name: (user) => {
      const firstName = user.firstName ? user.firstName : user.given_name;
      const lastName = user.lastName ? user.lastName : user.family_name;

      if (firstName || lastName)
        return `${firstName ? firstName : ""} ${lastName ? lastName : ""}`;
      return null;
    },
    firstName: (user) => (user.firstName ? user.firstName : user.given_name),
    lastName: (user) => (user.lastName ? user.lastName : user.family_name),
    createdAt: (user) => user.createdTimestamp,
    verifiedEmail: (user) => user.emailVerified,
    // email: async (user, args, { currentOrgMember, models: { OrgMember } }) => {
    //   if (currentOrgMember && currentOrgMember.isOrgAdmin) {
    //     const orgMember = await OrgMember.findOne({ userId: user.id });

    //     if (
    //       orgMember &&
    //       orgMember.organizationId.toString() ==
    //         currentOrgMember.organizationId.toString()
    //     )
    //       return user.email;
    //   }
    //   return null;
    // },
    isRootAdmin: () => false, //TODO: add something in keycloak that lets us define root admins
    avatar: () => null, //TODO: what about avatars in keycloak?
    // membership: async (
    //   user,
    //   { slug },
    //   { currentOrg, models: { OrgMember, EventMember, Event } }
    // ) => {
    //   if (!slug) return null;
    //   const event = await Event.findOne({
    //     organizationId: currentOrg.id,
    //     slug,
    //   });
    //   const orgMembership = await OrgMember.findOne({
    //     userId: user.id,
    //     organizationId: currentOrg.id,
    //   });
    //   return EventMember.findOne({
    //     orgMemberId: orgMembership.id,
    //     eventId: event.id,
    //   });
    // },
  },
  Organization: {
    events: async (organization, args, { models: { Event } }) => {
      return Event.find({ organizationId: organization.id });
    },
    discourseUrl: (organization) => organization.discourse?.url,
    finishedTodos: (org, args, { currentOrgMember }) => {
      if (!(currentOrgMember && currentOrgMember.isOrgAdmin)) {
        // You need to be logged in as organization admin
        return false;
      }

      return org.finishedTodos;
    },
  },
  Event: {
    // members: async (event, args, { models: { EventMember } }) => {
    //   return EventMember.find({ eventId: event.id });
    // },
    dreams: async (event, args, { models: { Dream } }) => {
      return Dream.find({ eventId: event.id });
    },
    numberOfApprovedMembers: async (
      event,
      args,
      { models: { EventMember } }
    ) => {
      return EventMember.countDocuments({
        eventId: event.id,
        isApproved: true,
      });
    },
    totalBudgetGrants: async (event) => {
      return Math.floor(event.totalBudget / event.grantValue);
    },
    remainingGrants: async (event, args, { models: { Grant } }) => {
      const [
        { grantsFromEverybody } = { grantsFromEverybody: 0 },
      ] = await Grant.aggregate([
        {
          $match: {
            eventId: mongoose.Types.ObjectId(event.id),
            reclaimed: false,
          },
        },
        { $group: { _id: null, grantsFromEverybody: { $sum: "$value" } } },
      ]);
      return (
        Math.floor(event.totalBudget / event.grantValue) - grantsFromEverybody
      );
    },
  },
  Dream: {
    cocreators: async (dream, args, { models: { EventMember } }) => {
      return EventMember.find({ _id: { $in: dream.cocreators } });
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
        { grantsForDream } = { grantsForDream: 0 },
      ] = await Grant.aggregate([
        {
          $match: {
            dreamId: mongoose.Types.ObjectId(dream.id),
            reclaimed: false,
          },
        },
        { $group: { _id: null, grantsForDream: { $sum: "$value" } } },
      ]);
      return grantsForDream;
    },
    comments: async (dream, args, { currentOrg }) => {
      if (currentOrg.discourse) {
        let discourseComments = [];
        if (dream.discourseTopicId) {
          const {
            post_stream: { posts },
          } = await discourse(currentOrg.discourse).posts.get(
            dream.discourseTopicId
          );
          discourseComments = posts.filter((post) => post.post_number !== 1);
        }
        // add together native comments with discourse posts to not have to migrate existings comments
        return [...dream.comments, ...discourseComments];
      }

      return dream.comments;
    },
    numberOfComments: async (dream, args, { currentOrg }) => {
      if (currentOrg.discourse && dream.discourseTopicId) {
        const { posts_count } = await discourse(currentOrg.discourse).posts.get(
          dream.discourseTopicId
        );
        return dream.comments.length + posts_count - 1;
      }
      return dream.comments.length;
    },
    favorite: async (
      dream,
      args,
      { currentOrgMember, models: { EventMember } }
    ) => {
      if (!currentOrgMember) return false;
      const currentEventMember = await EventMember.findOne({
        orgMemberId: currentOrgMember.id,
        eventId: dream.eventId,
      });
      if (!currentEventMember) return false;
      return currentEventMember.favorites.includes(dream.id);
    },
    raisedFlags: async (dream) => {
      const resolveFlagIds = dream.flags
        .filter((flag) => flag.type === "RESOLVE_FLAG")
        .map((flag) => flag.resolvingFlagId);

      return dream.flags.filter(
        (flag) =>
          flag.type === "RAISE_FLAG" && !resolveFlagIds.includes(flag.id)
      );
    },
    logs: async (
      dream,
      args,
      {
        models: {
          logs: { Log },
        },
      }
    ) => {
      return Log.find({ dreamId: dream.id });
    },
  },
  Comment: {
    createdAt: (post) => {
      if (post.createdAt) return post.createdAt; // comment from mongodb
      if (post.created_at) return new Date(post.created_at); // post from Discourse
      return null;
    },
    raw: (post) => post.content ?? null,
    discourseUsername: (post) => {
      if (post.username) return post.username;
      return null;
    },
    isLog: (comment) => {
      if (comment.isLog) return comment.isLog;
      if (comment.username === "system") return true;
      return false;
    },
    orgMember: async (post, args, { currentOrg, models: { OrgMember } }) => {
      // make logs anonymous
      if (post.isLog) return null;

      // comment from mongodb
      // TODO: Rename authorId in mongo models to orgMemberId
      // is it orgMemberId now? Huh. Maybe it is not eventMember then.. idk.. seems untrue.

      if (post.authorId) return OrgMember.findOne({ _id: post.authorId });

      // post from discourse
      return OrgMember.findOne({
        organizationId: currentOrg.id,
        discourseUsername: post.username,
      });
    },
  },
  Flag: {
    guideline: async (flag, args, { models: { Event } }) => {
      const event = await Event.findOne({ _id: flag.parent().eventId });

      return event.guidelines.id(flag.guidelineId);
    },
    user: async (parent, args, { models: { EventMember, Dream } }) => {
      // if not org admin or event admin or guide
      return null;
    },
  },
  Grant: {
    dream: async (grant, args, { models: { Dream } }) => {
      return Dream.findOne({ _id: grant.dreamId });
    },
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
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
    },
  }),
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  CustomFieldValue: {
    customField: async (customFieldValue, args, { models: { Event } }) => {
      const { eventId, fieldId } = customFieldValue;
      const event = await Event.findOne({ _id: eventId });
      const eventCustomField = event.customFields.filter(
        (eventCustomField) => eventCustomField.id == fieldId
      );

      if (!eventCustomField || eventCustomField.length == 0) {
        return {
          id: fieldId,
          name: "⚠️ Missing custom field ⚠️",
          description: "Custom field was removed",
          type: "TEXT",
          position: 1000,
          isRequired: false,
          createdAt: new Date(),
        };
      }
      return eventCustomField[0];
    },
  },
  CustomFieldFilterLabels: {
    customField: async (customFieldValue, args, { models: { Event } }) => {
      const { eventId, fieldId } = customFieldValue;
      const event = await Event.findOne({ _id: eventId });
      if (!event.customFields) {
        return;
      }
      const eventCustomField = event.customFields.filter(
        (eventCustomField) => eventCustomField.id == fieldId
      );
      return eventCustomField[0];
    },
  },
  Log: {
    details: (log) => log,
    user: async (log, args, { models: { User } }) => {
      return null;
      // TODO:  only show for admins
      // return User.findOne({ _id: log.userId });
    },
    type: (log) => log.__t,
    dream: async (log, args, { models: { Dream } }) => {
      return Dream.findOne({ _id: log.dreamId });
    },
    event: async (log, args, { models: { Event } }) => {
      return Event.findOne({ _id: log.eventId });
    },
  },
  LogDetails: {
    __resolveType: async (obj) => {
      if (obj.__t == "FlagRaised") return "FlagRaisedDetails";
      if (obj.__t == "FlagResolved") return "FlagResolvedDetails";
      return null;
    },
  },
  FlagRaisedDetails: {
    guideline: async (log, args, { models: { Event } }) => {
      const event = await Event.findOne({ _id: log.eventId });
      return event.guidelines.id(log.guidelineId);
    },
  },
  FlagResolvedDetails: {
    guideline: async (log, args, { models: { Event } }) => {
      const event = await Event.findOne({ _id: log.eventId });
      return event.guidelines.id(log.guidelineId);
    },
  },
};

module.exports = resolvers;
