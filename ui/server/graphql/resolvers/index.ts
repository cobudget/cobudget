import SeededShuffle from "seededshuffle";
import slugify from "../../utils/slugify";
//import liveUpdate from "../../services/liveUpdate.service";
import prisma from "../../prisma";
import { GraphQLScalarType } from "graphql";
import GraphQLJSON from "graphql-type-json";
import { GraphQLJSONObject } from "graphql-type-json";
import { Kind } from "graphql/language";
import mongoose from "mongoose";
import dayjs from "dayjs";
import { combineResolvers, skip } from "graphql-resolvers";
import { requiredAction } from "keycloak-admin";
import discourse from "../../lib/discourse";
import { allocateToMember } from "../../controller";
import {
  orgHasDiscourse,
  generateComment,
} from "../../subscribers/discourse.subscriber";
import { getCurrentOrgAndMember } from "./helpers";

const isRootAdmin = (parent, args, { user }) => {
  // TODO: this is old code that doesn't really work right now
  return user && user.isRootAdmin
    ? skip
    : new Error("You need to be root admin");
};

const isMemberOfOrg = async (parent, { id }, { user }) => {
  if (!user) throw new Error("You need to be logged in");

  const currentOrgMember = await prisma.orgMember.findUnique({
    where: { organizationId_userId: { userId: user.id, organizationId: id } },
  });

  if (!currentOrgMember)
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
    currentUser: (parent, args, { user }) => {
      return user ? { ...user } : null;
    },
    currentOrg: async (parent, { orgSlug }) => {
      if (!orgSlug) return null;
      return prisma.organization.findUnique({ where: { slug: orgSlug } });
    },
    currentOrgMember: async (parent, { orgSlug: slug }, { user }) => {
      if (!user || !slug) return null;

      const orgMember = await prisma.orgMember.findFirst({
        where: { organization: { slug }, userId: user.id },
      });

      // const org = await prisma.organization.findUnique({ where: { slug } });

      // const orgMember = await prisma.orgMember.findUnique({
      //   where: {
      //     organizationId_userId: { organizationId: org.id, userId: user.id },
      //   },
      // });
      return orgMember;
    },
    organization: combineResolvers(isMemberOfOrg, async (parent, { id }) => {
      return prisma.organization.findUnique({ where: { id } });
    }),
    organizations: combineResolvers(isRootAdmin, async (parent, args) => {
      return prisma.organization.findMany();
    }),
    events: async (parent, { limit, orgSlug }, { user }) => {
      if (!orgSlug) return null;

      const currentOrgMember = user
        ? await prisma.orgMember.findFirst({
            where: { organization: { slug: orgSlug }, userId: user.id },
          })
        : null;

      // if admin show all events (current or archived)
      if (currentOrgMember && currentOrgMember.isOrgAdmin) {
        return prisma.collection.findMany({
          where: { organization: { slug: orgSlug } },
          take: limit,
        });
      }

      return prisma.collection.findMany({
        where: {
          organization: { slug: orgSlug },
          archived: { not: true },
        },
        take: limit,
      });
    },
    event: async (parent, { orgSlug, collectionSlug }) => {
      if (!orgSlug || !collectionSlug) return null;

      return await prisma.collection.findFirst({
        where: { slug: collectionSlug, organization: { slug: orgSlug } },
      });
    },
    contributionsPage: async (parent, { eventId, offset, limit }, { user }) => {
      if (!user) throw new Error("You need to be logged in");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: eventId } } },
          userId: user.id,
        },
        include: {
          collectionMemberships: { where: { collectionId: eventId } },
        },
      });

      const collectionMember = currentOrgMember?.collectionMemberships?.[0];

      if (!currentOrgMember) throw new Error("You need to be an org member");

      if (!(currentOrgMember?.isOrgAdmin || collectionMember?.isAdmin))
        throw new Error("You need to be org or collection admin to view this");

      // const contributionsWithExtra = [
      //   ...(await Contribution.find({ eventId }, null, {
      //     skip: offset,
      //     limit: limit + 1,
      //   }).sort({
      //     createdAt: -1,
      //   })),
      // ];

      const contributionsWithExtra = await prisma.contribution.findMany({
        where: { collectionId: eventId },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        moreExist: contributionsWithExtra.length > limit,
        contributions: contributionsWithExtra.slice(0, limit),
      };
    },
    dream: async (parent, { id }) => {
      return prisma.bucket.findUnique({ where: { id } });
    },
    dreamsPage: async (
      parent,
      { eventSlug, orgSlug, textSearchTerm, tag: tagValue, offset = 0, limit },
      { user }
    ) => {
      const currentOrg = await prisma.organization.findUnique({
        where: { slug: orgSlug },
        include: {
          collections: { where: { slug: eventSlug } },
          ...(user && {
            orgMembers: {
              where: { userId: user.id },
              select: {
                id: true,
                isOrgAdmin: true,
                collectionMemberships: {
                  where: { collection: { slug: eventSlug } },
                  select: { id: true, isAdmin: true, isGuide: true },
                },
              },
            },
          }),
        },
      });

      const currentOrgMember = currentOrg.orgMembers?.[0];
      const currentEventMember = currentOrgMember?.collectionMemberships?.[0];
      const collection = currentOrg.collections?.[0];
      // const currentOrgMember = user
      //   ? await prisma.orgMember.findFirst({
      //       where: {
      //         organization: { slug: orgSlug },
      //         userId: user.id,
      //       },
      //       select: {
      //         id: true,
      //         isOrgAdmin: true,
      //         createdAt: true,
      //         collectionMemberships: {
      //           where: { collection: { slug: eventSlug } },
      //           select: { isAdmin: true, isGuide: true },
      //         },
      //         organization: true,
      //       },
      //     })
      //   : null;

      // const collection = await prisma.collection.findUnique({
      //   where: {
      //     organizationId_slug: {
      //       organizationId: currentOrgMember.organization.id,
      //       slug: eventSlug,
      //     },
      //   },
      // });

      // let currentEventMember;

      // if (currentOrgMember) {
      //   currentEventMember = await prisma.collectionMember.findUnique({
      //     where: {
      //       orgMemberId_collectionId: {
      //         orgMemberId: currentOrgMember.id,
      //         collectionId: collection.id,
      //       },
      //     },
      //   });
      // }
      console.log({
        currentOrgMember,
        currentEventMember,
        currentOrg,
        collection,
      });

      const tagQuery = {
        ...(tagValue
          ? {
              tags: { some: { value: tagValue } },
            }
          : null),
      };

      const adminQuery = {
        collectionId: collection.id,
        ...(textSearchTerm && { title: { search: textSearchTerm } }),
        ...tagQuery,
      };
      // todo: create appropriate index for this query
      // if event member, show dreams that are publisehd AND dreams where member is cocreator
      // const memberQuery = ;
      const othersQuery = {
        collectionId: collection.id,
        publishedAt: { not: null },
        ...(textSearchTerm && { title: { search: textSearchTerm } }),
        ...tagQuery,
      };

      const query =
        currentEventMember &&
        (currentEventMember.isAdmin || currentEventMember.isGuide)
          ? adminQuery
          : currentEventMember
          ? {
              collectionId: collection.id,
              OR: [
                { publishedAt: { not: null } },
                { cocreators: { some: { id: currentEventMember.id } } },
              ],
              ...(textSearchTerm && { title: { search: textSearchTerm } }),
              ...tagQuery,
            }
          : othersQuery;

      const todaySeed = dayjs().format("YYYY-MM-DD");
      const buckets = await prisma.bucket.findMany({
        where: query,
      });
      const shuffledBuckets = SeededShuffle.shuffle(
        buckets,
        user?.id ?? todaySeed
      );

      return {
        moreExist: shuffledBuckets.length > limit + offset,
        dreams: shuffledBuckets.slice(offset, limit + offset),
      };
    },
    orgMembersPage: async (
      parent,
      { offset = 0, limit, orgSlug },
      { user }
    ) => {
      if (!orgSlug) return null;

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: { organization: { slug: orgSlug }, userId: user.id },
      });

      if (!currentOrgMember?.isOrgAdmin)
        throw new Error("You need to be org admin to view this");

      // TODO: Why is it limit + 1?
      const orgMembersWithExtra = await prisma.orgMember.findMany({
        where: { organization: { slug: orgSlug } },
        skip: offset,
        take: limit + 1,
      });

      return {
        moreExist: orgMembersWithExtra.length > limit,
        orgMembers: orgMembersWithExtra.slice(0, limit),
      };
    },
    members: async (parent, { eventId, isApproved }, { user }) => {
      const org = await prisma.organization.findFirst({
        where: { collections: { some: { id: eventId } } },
      });

      const currentOrgMember = await prisma.orgMember.findUnique({
        where: {
          organizationId_userId: { organizationId: org.id, userId: user.id },
        },
      });

      if (!currentOrgMember)
        throw new Error("You need to be a member of this org");

      const currentCollectionMember = await prisma.collectionMember.findFirst({
        where: { collectionId: eventId, orgMemberId: currentOrgMember.id },
      });

      if (
        !(
          (currentCollectionMember && currentCollectionMember.isApproved) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error(
          "You need to be approved member of this collection or org admin to view collection members"
        );

      return await prisma.collectionMember.findMany({
        where: {
          collectionId: eventId,
          ...(typeof isApproved === "boolean" && { isApproved }),
        },
      });
    },
    membersPage: async (
      parent,
      { eventId, isApproved, offset = 0, limit = 10 },
      { user }
    ) => {
      const currentOrgMember = user
        ? await prisma.orgMember.findFirst({
            where: {
              organization: { collections: { some: { id: eventId } } },
              userId: user.id,
            },
          })
        : null;
      if (!currentOrgMember)
        throw new Error("You need to be a member of this org");

      const currentCollectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: eventId,
          },
        },
      });

      if (
        !(
          (currentCollectionMember && currentCollectionMember.isApproved) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error(
          "You need to be approved member of this collection or org admin to view collection members"
        );

      const collectionMembersWithExtra = await prisma.collectionMember.findMany(
        {
          where: {
            collectionId: eventId,
            ...(typeof isApproved === "boolean" && { isApproved }),
          },
          take: limit + 1,
          skip: offset,
        }
      );

      return {
        moreExist: collectionMembersWithExtra.length > limit,
        members: collectionMembersWithExtra.slice(0, limit),
      };
    },
    categories: async (parent, { orgId }) => {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: { discourse: true },
      });

      if (!org.discourse) {
        return [];
      }

      // TODO: permission check here?

      const categories = await discourse(org.discourse).categories.getAll();

      return categories;
    },
    commentSet: async (
      parent,
      { dreamId, from = 0, limit = 30, order = "desc" },
      { user }
    ) => {
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: {
          comments: true,
          collection: {
            include: { organization: { include: { discourse: true } } },
          },
        },
      });
      // const dream = await Dream.findOne({ _id: dreamId });

      let comments;
      const org = bucket.collection.organization;

      if (orgHasDiscourse(org)) {
        const topic = await discourse(org.discourse).posts.get(
          bucket.discourseTopicId
        );

        comments = await Promise.all(
          topic.post_stream.posts
            .filter((post) => post.post_number > 1)
            .filter((post) => !post.user_deleted)
            // filter out empty system comments, e.g. when a thread is moved
            .filter(
              (comment) =>
                !(comment.username === "system" && comment.raw === "")
            )
            .map(async (post) => {
              const author = await prisma.orgMember.findFirst({
                where: {
                  organizationId: org.id,
                  discourseUsername: post.username,
                },
              });

              return generateComment(post, author);
            })
        );
      } else {
        comments = await prisma.comment.findMany({
          where: { bucketId: dreamId },
          orderBy: { createdAt: "desc" },
        });
      }

      let shown = comments.slice(0, from + limit);

      if (order === "desc") {
        shown = shown.reverse();
      }

      return {
        total: comments.length,
        comments: shown,
      };
    },
  },
  Mutation: {
    createOrganization: async (
      parent,
      { name, slug, logo },
      { user, eventHub }
    ) => {
      if (!user) throw new Error("You need to be logged in!");

      const org = await prisma.organization.create({
        data: {
          name,
          slug: slugify(slug),
          logo,
          orgMembers: { create: { userId: user.id, isOrgAdmin: true } },
        },
        include: {
          orgMembers: true,
        },
      });

      await eventHub.publish("create-organization", {
        currentOrganization: org,
        currentOrgMember: org.orgMembers[0],
      });

      return org;
    },
    editOrganization: async (
      parent,
      { organizationId, name, slug, logo },
      { user, eventHub }
    ) => {
      const currentOrgMember = await prisma.orgMember.findUnique({
        where: {
          organizationId_userId: { organizationId, userId: user.id },
        },
      });

      if (!(currentOrgMember && currentOrgMember.isOrgAdmin))
        throw new Error("You need to be logged in as organization admin.");
      if (
        organizationId !== currentOrgMember.organizationId &&
        !user?.isRootAdmin
      )
        throw new Error("You are not a member of this organization.");

      const organization = await prisma.organization.update({
        where: {
          id: organizationId,
        },
        data: { name, logo, slug: slugify(slug) },
      });

      // TODO: add back
      // await eventHub.publish("edit-organization", {
      //   currentOrg: organization,
      //   currentOrgMember,
      // });
      return organization;
    },
    setTodosFinished: async (parent, { orgId }, { user }) => {
      const { currentOrgMember, currentOrg } = await getCurrentOrgAndMember({
        orgId,
        user,
      });

      if (!(currentOrgMember && currentOrgMember.isOrgAdmin))
        throw new Error("You need to be logged in as organization admin.");

      const org = await prisma.organization.update({
        where: { id: currentOrg.id },
        data: { finishedTodos: true },
      });
      return org;
    },
    createEvent: async (
      parent,
      { orgId, slug, title, currency, registrationPolicy },
      { eventHub, user }
    ) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        orgId,
        user,
      });

      if (!(currentOrgMember && currentOrgMember.isOrgAdmin))
        throw new Error("You need to be logged in as organisation admin.");

      const collection = await prisma.collection.create({
        data: {
          slug,
          title,
          currency,
          registrationPolicy,
          organizationId: currentOrg.id,
          collectionMember: {
            create: {
              orgMemberId: currentOrgMember.id,
              isAdmin: true,
              isApproved: true,
            },
          },
          fields: {
            create: {
              name: "Description",
              description: "Describe your bucket",
              type: "MULTILINE_TEXT",
              isRequired: false,
              position: 1001,
            },
          },
        },
      });

      await eventHub.publish("create-event", {
        currentOrg,
        currentOrgMember,
        event: collection,
      });

      return collection;
    },
    editEvent: async (
      parent,
      {
        orgId,
        eventId,
        slug,
        title,
        archived,
        registrationPolicy,
        info,
        color,
        about,
        dreamReviewIsOpen,
        discourseCategoryId,
      },
      { user, eventHub }
    ) => {
      const currentOrgMember = await prisma.orgMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: user.id,
          },
        },
        include: {
          organization: true,
          collectionMemberships: { where: { collectionId: eventId } },
        },
      });

      const collectionMember = currentOrgMember.collectionMemberships[0];

      const collection = await prisma.collection.findUnique({
        where: { id: eventId },
      });
      if (!collection)
        throw new Error("Can't find collection in your organization to edit");

      if (
        !(
          (collectionMember && collectionMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin of this collection.");

      if (slug) collection.slug = slugify(slug);
      if (title) collection.title = title;
      if (typeof archived !== "undefined") collection.archived = archived;
      if (registrationPolicy)
        collection.registrationPolicy = registrationPolicy;
      if (typeof info !== "undefined") collection.info = info;
      if (typeof about !== "undefined") collection.about = about;
      if (color) collection.color = color;
      if (typeof dreamReviewIsOpen !== "undefined")
        collection.dreamReviewIsOpen = dreamReviewIsOpen;
      if (discourseCategoryId)
        collection.discourseCategoryId = discourseCategoryId;

      await eventHub.publish("edit-event", {
        currentOrg: currentOrgMember.organization,
        currentOrgMember,
        event: collection,
      });
      return prisma.collection.update({
        where: { id: eventId },
        data: { ...collection },
      });
    },
    deleteEvent: async (parent, { eventId }, { user, eventHub }) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        collectionId: eventId,
        user,
      });

      if (!(currentOrgMember && currentOrgMember.isOrgAdmin))
        throw new Error("You need to be org. admin to delete event");

      const collection = await prisma.collection.updateMany({
        where: { id: eventId, organizationId: currentOrgMember.id },
        data: { deleted: true },
      });

      await eventHub.publish("delete-event", {
        currentOrg,
        currentOrgMember,
        event: collection,
      });

      return collection;
    },
    addGuideline: async (
      parent,
      { eventId, guideline: { title, description } },
      { user }
    ) => {
      if (!user) throw new Error("You need to be logged in");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: eventId } } },
          userId: user.id,
        },
        include: {
          collectionMemberships: { where: { collectionId: eventId } },
        },
      });

      const collectionMember = currentOrgMember?.collectionMemberships?.[0];

      if (
        !(
          (collectionMember && collectionMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to add a guideline");

      const guidelines = await prisma.guideline.findMany({
        where: { collectionId: eventId },
      });

      const position =
        guidelines
          .map((g) => g.position)
          .reduce((a, b) => Math.max(a, b), 1000) + 1;

      const guideline = await prisma.guideline.create({
        data: { collectionId: eventId, title, description, position },
        include: { collection: true },
      });
      return guideline.collection;
    },
    editGuideline: async (
      parent,
      { eventId, guidelineId, guideline: { title, description } },
      { user }
    ) => {
      if (!user) throw new Error("You need to be logged in");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: eventId } } },
          userId: user.id,
        },
        include: {
          collectionMemberships: {
            where: { collectionId: eventId },
            include: { collection: { include: { guidelines: true } } },
          },
        },
      });

      const collectionMember = currentOrgMember?.collectionMemberships?.[0];

      if (
        !(
          (collectionMember && collectionMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to edit a guideline");

      if (
        !collectionMember.collection.guidelines
          .map((g) => g.id)
          .includes(guidelineId)
      )
        throw new Error("This guideline is not part of this collection");

      const guideline = await prisma.guideline.update({
        where: { id: guidelineId },
        data: { title, description },
        include: { collection: true },
      });

      return guideline.collection;
    },
    setGuidelinePosition: async (
      parent,
      { eventId, guidelineId, newPosition },
      { user }
    ) => {
      if (!user) throw new Error("You need to be logged in");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: eventId } } },
          userId: user.id,
        },
        include: {
          collectionMemberships: {
            where: { collectionId: eventId },
            include: { collection: { include: { guidelines: true } } },
          },
        },
      });

      const collectionMember = currentOrgMember?.collectionMemberships?.[0];

      if (
        !(
          (collectionMember && collectionMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to edit a guideline");

      if (
        !collectionMember.collection.guidelines
          .map((g) => g.id)
          .includes(guidelineId)
      )
        throw new Error("This guideline is not part of this collection");

      const guideline = await prisma.guideline.update({
        where: { id: guidelineId },
        data: { position: newPosition },
        include: { collection: true },
      });

      return guideline.collection;
    },
    deleteGuideline: async (parent, { eventId, guidelineId }, { user }) => {
      if (!user) throw new Error("You need to be logged in");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: eventId } } },
          userId: user.id,
        },
        include: {
          collectionMemberships: {
            where: { collectionId: eventId },
          },
        },
      });

      const collectionMember = currentOrgMember?.collectionMemberships?.[0];

      if (
        !(
          (collectionMember && collectionMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to delete a guideline");

      const collection = await prisma.collection.update({
        where: { id: eventId },
        data: { guidelines: { delete: { id: guidelineId } } },
      });
      return collection;
    },
    addCustomField: async (
      parent,
      { eventId, customField: { name, description, type, limit, isRequired } },
      { user }
    ) => {
      if (!user) throw new Error("You need to be logged in");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: eventId } } },
          userId: user.id,
        },
        include: {
          collectionMemberships: {
            where: { collectionId: eventId },
          },
        },
      });

      const collectionMember = currentOrgMember?.collectionMemberships?.[0];

      if (
        !(
          (collectionMember && collectionMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to add a custom field");

      const customFields = await prisma.field.findMany({
        where: { collectionId: eventId },
      });

      const position =
        customFields
          .map((g) => g.position)
          .reduce((a, b) => Math.max(a, b), 1000) + 1;

      const customField = await prisma.field.create({
        data: {
          collectionId: eventId,
          name,
          description,
          type,
          limit,
          isRequired,
          position,
        },
        include: { collection: true },
      });
      return customField.collection;
    },
    // Based on https://softwareengineering.stackexchange.com/a/195317/54663
    setCustomFieldPosition: async (
      parent,
      { eventId, fieldId, newPosition },
      { user }
    ) => {
      if (!user) throw new Error("You need to be logged in");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: eventId } } },
          userId: user.id,
        },
        include: {
          collectionMemberships: {
            where: { collectionId: eventId },
            include: { collection: { include: { fields: true } } },
          },
        },
      });

      const collectionMember = currentOrgMember?.collectionMemberships?.[0];

      if (
        !(
          (collectionMember && collectionMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to edit a field");

      if (
        !collectionMember.collection.fields.map((g) => g.id).includes(fieldId)
      )
        throw new Error("This field is not part of this collection");

      const field = await prisma.field.update({
        where: { id: fieldId },
        data: { position: newPosition },
        include: { collection: true },
      });

      return field.collection;
    },
    editCustomField: async (
      parent,
      {
        eventId,
        fieldId,
        customField: { name, description, type, limit, isRequired },
      },
      { user }
    ) => {
      if (!user) throw new Error("You need to be logged in");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: eventId } } },
          userId: user.id,
        },
        include: {
          collectionMemberships: {
            where: { collectionId: eventId },
            include: { collection: { include: { fields: true } } },
          },
        },
      });

      const collectionMember = currentOrgMember?.collectionMemberships?.[0];

      if (
        !(
          (collectionMember && collectionMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to edit a field");

      if (
        !collectionMember.collection.fields.map((g) => g.id).includes(fieldId)
      )
        throw new Error("This field is not part of this collection");

      const field = await prisma.field.update({
        where: { id: fieldId },
        data: { name, description, type, limit, isRequired },
        include: { collection: true },
      });

      return field.collection;
    },
    deleteCustomField: async (parent, { eventId, fieldId }, { user }) => {
      if (!user) throw new Error("You need to be logged in");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: eventId } } },
          userId: user.id,
        },
        include: {
          collectionMemberships: {
            where: { collectionId: eventId },
          },
        },
      });

      const collectionMember = currentOrgMember?.collectionMemberships?.[0];

      if (
        !(
          (collectionMember && collectionMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to delete a field");

      const collection = await prisma.collection.update({
        where: { id: eventId },
        data: { fields: { delete: { id: fieldId } } },
      });
      return collection;
    },
    createDream: async (parent, { eventId, title }, { user, eventHub }) => {
      if (!user) throw new Error("You need to be logged in");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: eventId } } },
          userId: user.id,
        },
        include: {
          organization: true,
          collectionMemberships: {
            where: { collectionId: eventId },
            include: { collection: true },
          },
        },
      });

      const collectionMember = currentOrgMember?.collectionMemberships?.[0];

      if (!collectionMember || !collectionMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      const { collection } = collectionMember;

      const bucketCreationIsOpen = collection.bucketCreationCloses
        ? dayjs().isBefore(dayjs(collection.bucketCreationCloses))
        : true;

      if (!bucketCreationIsOpen) throw new Error("Bucket creation is not open");

      const bucket = await prisma.bucket.create({
        data: {
          collection: { connect: { id: eventId } },
          title,
          cocreators: { connect: { id: collectionMember.id } },
        },
      });

      await eventHub.publish("create-dream", {
        currentOrg: currentOrgMember.organization,
        currentOrgMember,
        dream: bucket,
        event: collection,
      });

      return bucket;
    },
    editDream: async (
      parent,
      { dreamId, title, description, summary, images, budgetItems },
      { user, eventHub }
    ) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { cocreators: true, collection: true },
      });

      const eventMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !eventMember ||
        (!bucket.cocreators.map((m) => m.id).includes(eventMember.id) &&
          !eventMember.isAdmin &&
          !eventMember.isGuide)
      )
        throw new Error("You are not a cocreator of this dream.");

      const updated = await prisma.bucket.update({
        where: { id: dreamId },
        data: {
          title,
          description,
          summary,
          ...(typeof budgetItems !== "undefined" && {
            BudgetItems: { deleteMany: {}, createMany: { data: budgetItems } },
          }),
          ...(typeof images !== "undefined" && {
            Images: { deleteMany: {}, createMany: { data: images } },
          }),
        },
      });

      // TODO: behöver den här event ak.a collection?
      await eventHub.publish("edit-dream", {
        currentOrg,
        currentOrgMember,
        event: bucket.collection,
        dream: updated,
      });

      return updated;
    },
    addTag: async (parent, { dreamId, tagId, tagValue }, { user }) => {
      const { currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });

      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { cocreators: true },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !collectionMember ||
        (!bucket.cocreators.map((c) => c.id).includes(collectionMember.id) &&
          !collectionMember.isAdmin &&
          !collectionMember.isGuide)
      )
        throw new Error("You are not a cocreator of this bucket.");

      if (!tagId || !tagValue)
        throw new Error("You need to provide tag id or value");

      return await prisma.bucket.update({
        where: { id: dreamId },
        data: {
          tags: {
            connectOrCreate: {
              where: { id: tagId },
              create: { value: tagValue, collectionId: bucket.collectionId },
            },
          },
        },
      });
    },
    removeTag: async (_, { dreamId, tagId }, { user }) => {
      const { currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { cocreators: true },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !collectionMember ||
        (!bucket.cocreators.map((c) => c.id).includes(collectionMember.id) &&
          !collectionMember.isAdmin &&
          !collectionMember.isGuide)
      )
        throw new Error("You are not a cocreator of this bucket.");

      return await prisma.bucket.update({
        where: { id: dreamId },
        data: { tags: { disconnect: { id: tagId } } },
      });
    },
    editDreamCustomField: async (
      parent,
      { dreamId, customField: { fieldId, value } },
      { user, eventHub }
    ) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { cocreators: true },
      });

      const eventMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !eventMember ||
        (!bucket.cocreators.map((m) => m.id).includes(eventMember.id) &&
          !eventMember.isAdmin &&
          !eventMember.isGuide)
      )
        throw new Error("You are not a cocreator of this dream.");

      const updated = await prisma.bucket.update({
        where: { id: dreamId },
        data: {
          FieldValues: {
            upsert: {
              where: { bucketId_fieldId: { bucketId: dreamId, fieldId } },
              create: { fieldId, value },
              update: { value },
            },
          },
        },
        include: { collection: true },
      });

      await eventHub.publish("edit-dream", {
        currentOrg,
        currentOrgMember,
        event: updated.collection,
        dream: updated,
      });

      return updated;
    },
    deleteDream: async (parent, { dreamId }, { user, eventHub }) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { cocreators: true, collection: true },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !collectionMember ||
        (!bucket.cocreators.map((c) => c.id).includes(collectionMember.id) &&
          !collectionMember.isAdmin &&
          !collectionMember.isGuide)
      )
        throw new Error("You are not a cocreator of this bucket.");

      const {
        _sum: { amount: contributionsForBucket },
      } = await prisma.contribution.aggregate({
        where: { bucketId: bucket.id },
        _sum: { amount: true },
      });

      if (contributionsForBucket > 0) {
        throw new Error(
          "You cant delete a Dream that has received contributions"
        );
      }

      await eventHub.publish("delete-dream", {
        currentOrg,
        currentOrgMember,
        event: bucket.collection,
        dream: bucket,
      });
      return bucket;
    },
    addCocreator: async (parent, { dreamId, memberId }, { user }) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { cocreators: true },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !collectionMember ||
        (!bucket.cocreators.map((m) => m.id).includes(collectionMember.id) &&
          !collectionMember.isAdmin &&
          !collectionMember.isGuide)
      )
        throw new Error("You are not a cocreator of this bucket.");

      const updated = await prisma.bucket.update({
        where: { id: dreamId },
        data: {
          cocreators: {
            connect: { id: memberId },
          },
        },
      });

      return updated;
    },
    removeCocreator: async (parent, { dreamId, memberId }, { user }) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { cocreators: true },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !collectionMember ||
        (!bucket.cocreators.map((m) => m.id).includes(collectionMember.id) &&
          !collectionMember.isAdmin &&
          !collectionMember.isGuide)
      )
        throw new Error("You are not a cocreator of this bucket.");

      return await prisma.bucket.update({
        where: { id: dreamId },
        data: { cocreators: { disconnect: { id: memberId } } },
      });
    },
    publishDream: async (
      parent,
      { dreamId, unpublish },
      { user, eventHub }
    ) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { collection: true, cocreators: true },
      });
      // const dream = await Dream.findOne({ _id: dreamId });
      // const event = await Event.findOne({ _id: dream.eventId });

      const eventMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !eventMember ||
        (!bucket.cocreators.map((m) => m.id).includes(eventMember.id) &&
          !eventMember.isAdmin &&
          !eventMember.isGuide)
      )
        throw new Error("You are not a cocreator of this dream.");

      const { prisma: prismaResult } = await eventHub.publish("publish-dream", {
        currentOrg,
        currentOrgMember,
        event: bucket.collection,
        dream: bucket,
        unpublish,
      });

      return prismaResult;
    },
    addComment: async (parent, { content, dreamId }, { user, eventHub }) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      if (!currentOrgMember) {
        throw new Error("You need to be an org member to post comments.");
      }

      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { collection: true },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collection.id,
          },
        },
      });

      if (!collectionMember) {
        throw new Error(
          "You need to be a member of the collection to post comments."
        );
      }

      if (orgHasDiscourse(currentOrg) && !currentOrgMember.discourseApiKey) {
        throw new Error(
          "You need to have a discourse account connected, go to /connect-discourse"
        );
      }

      if (content.length < (currentOrg.discourse?.minPostLength || 3)) {
        throw new Error(
          `Your post needs to be at least ${
            currentOrg.discourse?.minPostLength || 3
          } characters long!`
        );
      }

      const comment = { content, authorId: currentOrgMember.id };

      const { discourse, prisma: prismaResult } = await eventHub.publish(
        "create-comment",
        {
          currentOrg,
          currentOrgMember,
          dream: bucket,
          event: bucket.collection,
          comment,
        }
      );

      return discourse || prismaResult;
    },

    deleteComment: async (
      parent,
      { dreamId, commentId },
      { user, eventHub }
    ) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { collection: true },
      });

      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!currentOrgMember)
        throw new Error("You need to be member of the org to delete comments");

      const eventMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collection.id,
          },
        },
      });

      await eventHub.publish("delete-comment", {
        currentOrg,
        currentOrgMember,
        event: bucket.collection,
        eventMember,
        dream: bucket,
        comment,
      });

      return comment;
    },
    editComment: async (
      parent,
      { dreamId, commentId, content },
      { user, eventHub }
    ) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      let comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { Bucket: { include: { collection: true } } },
      });
      comment = { ...comment, content };

      const eventMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: comment.Bucket.collection.id,
          },
        },
        include: { orgMember: true },
      });

      // TODO: permissions?
      //if (!eventMember || comment.orgMemberId !== currentOrgMember)
      const { discourse, prisma: prismaResult } = await eventHub.publish(
        "edit-comment",
        {
          currentOrg,
          currentOrgMember,
          eventMember,
          dream: comment.Bucket,
          comment,
        }
      );
      return discourse || prismaResult;
    },
    raiseFlag: async (parent, { dreamId, guidelineId, comment }, { user }) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      // check dreamReviewIsOpen
      // check not already left a flag?
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: {
          collection: {
            include: { guidelines: { where: { id: guidelineId } } },
          },
        },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collection.id,
          },
        },
      });

      if (!collectionMember || !collectionMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      let updated = await prisma.bucket.update({
        where: { id: dreamId },
        data: {
          flags: {
            create: {
              guidelineId,
              type: "RAISE_FLAG",
              orgMemberId: currentOrgMember.id,
              comment,
            },
          },
        },
      });

      const logContent = `Someone flagged this dream for the **${bucket.collection.guidelines[0].title}** guideline: \n> ${comment}`;

      if (orgHasDiscourse(currentOrg)) {
        if (!bucket.discourseTopicId) {
          // TODO: break out create thread into separate function
          const discoursePost = await discourse(
            currentOrg.discourse
          ).posts.create(
            {
              title: bucket.title,
              raw: `https://${
                currentOrg.customDomain
                  ? currentOrg.customDomain
                  : `${currentOrg.subdomain}.${process.env.DEPLOY_URL}`
              }/${bucket.collection.slug}/${dream.id}`,
              ...(currentOrg.discourse.dreamsCategoryId && {
                category: currentOrg.discourse.dreamsCategoryId,
              }),
            },
            {
              username: "system",
            }
          );
          updated = await prisma.bucket.update({
            where: { id: dreamId },
            data: { discourseTopicId: discoursePost.topic_id },
          });
        }

        await discourse(currentOrg.discourse).posts.create(
          {
            topic_id: updated.discourseTopicId,
            raw: logContent,
          },
          { username: "system" }
        );
      } else {
        await prisma.comment.create({
          data: {
            content: logContent,
            isLog: true,
            orgMemberId: currentOrgMember.id,
          },
        });
      }

      return updated;
    },
    resolveFlag: async (parent, { dreamId, flagId, comment }, { user }) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      // check dreamReviewIsOpen
      // check not already left a flag?

      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: {
          collection: true,
          flags: {
            where: { id: flagId },
            include: { guideline: true },
          },
        },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collection.id,
          },
        },
      });

      if (!collectionMember || !collectionMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      let updated = await prisma.bucket.update({
        where: { id: dreamId },
        data: {
          flags: {
            create: {
              resolvingFlagId: flagId,
              type: "RESOLVE_FLAG",
              orgMemberId: currentOrgMember.id,
              comment,
            },
          },
        },
      });

      const resolvedFlagGuideline = bucket.flags[0].guideline;

      const logContent = `Someone resolved a flag for the **${resolvedFlagGuideline.title}** guideline: \n> ${comment}`;

      if (orgHasDiscourse(currentOrg)) {
        if (!bucket.discourseTopicId) {
          // TODO: break out create thread into separate function
          const discoursePost = await discourse(
            currentOrg.discourse
          ).posts.create(
            {
              title: bucket.title,
              raw: `https://${
                currentOrg.customDomain
                  ? currentOrg.customDomain
                  : `${currentOrg.subdomain}.${process.env.DEPLOY_URL}`
              }/${bucket.collection.slug}/${bucket.id}`,
              ...(currentOrg.discourse.dreamsCategoryId && {
                category: currentOrg.discourse.dreamsCategoryId,
              }),
            },
            {
              username: "system",
            }
          );
          updated = await prisma.bucket.update({
            where: { id: dreamId },
            data: { discourseTopicId: discoursePost.topic_id },
          });
        }
        await discourse(currentOrg.discourse).posts.create(
          {
            topic_id: updated.discourseTopicId,
            raw: logContent,
          },
          { username: "system" }
        );
      } else {
        await prisma.comment.create({
          data: {
            content: logContent,
            isLog: true,
            orgMemberId: currentOrgMember.id,
          },
        });
      }

      return updated;
    },
    allGoodFlag: async (parent, { dreamId }, { user }) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      // check dreamReviewIsOpen
      // check have not left one of these flags already
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: {
          flags: {
            where: { orgMemberId: currentOrgMember.id, type: "ALL_GOOD_FLAG" },
          },
        },
      });

      if (bucket.flags.length)
        throw new Error("You have already left an all good flag");

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (!collectionMember || !collectionMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      return await prisma.bucket.update({
        where: { id: dreamId },
        data: {
          flags: {
            create: { type: "ALL_GOOD_FLAG", orgMemberId: currentOrgMember.id },
          },
        },
      });
    },

    joinOrg: async (parent, { orgId }, { user }) => {
      if (!user) throw new Error("You need to be logged in.");

      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        orgId,
        user,
      });

      return await prisma.orgMember.create({
        data: { userId: user.id, organizationId: currentOrg.id },
      });
    },
    updateProfile: async (parent, { orgId, name, username, bio }, { user }) => {
      if (!user) throw new Error("You need to be logged in..");
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        orgId,
        user,
      });
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(typeof name !== "undefined" && { name }),
          ...(typeof username !== "undefined" && { username }),
          ...(typeof bio !== "undefined" &&
            currentOrgMember && {
              orgMemberships: {
                update: { where: { id: currentOrgMember.id }, data: { bio } },
              },
            }),
        },
      });

      return updatedUser;
    },
    inviteEventMembers: async (
      parent,
      { emails: emailsString, eventId },
      { user }
    ) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        collectionId: eventId,
        user,
      });

      const currentEventMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: eventId,
          },
        },
        include: { collection: true },
      });

      if (!(currentOrgMember.isOrgAdmin || currentEventMember?.isAdmin))
        throw new Error("You need to be admin to invite new members");

      const emails = emailsString.split(",");

      if (emails.length > 1000)
        throw new Error("You can only invite 1000 people at a time");

      const invitedCollectionMembers = [];

      for (const email of emails) {
        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });

        if (user) {
          const orgMember = await prisma.orgMember.findUnique({
            where: {
              organizationId_userId: {
                userId: user.id,
                organizationId: currentOrg.id,
              },
            },
          });
          if (orgMember) {
            const eventMember = await prisma.collectionMember.upsert({
              where: {
                orgMemberId_collectionId: {
                  orgMemberId: orgMember.id,
                  collectionId: eventId,
                },
              },
              create: {
                orgMemberId: orgMember.id,
                collectionId: eventId,
                isApproved: true,
              },
              update: {
                isApproved: true,
              },
            });
            invitedCollectionMembers.push(eventMember);
          } else {
            const orgMember = await prisma.orgMember.create({
              data: {
                userId: user.id,
                organizationId: currentOrgMember.organizationId,
                collectionMemberships: {
                  create: { collectionId: eventId, isApproved: true },
                },
              },
              include: {
                collectionMemberships: true,
              },
            });

            invitedCollectionMembers.push(orgMember.collectionMemberships[0]);
          }
        } else {
          const user = await prisma.user.create({
            data: {
              email: email.trim().toLowerCase(),
              orgMemberships: {
                create: {
                  organizationId: currentOrg.id,
                  collectionMemberships: {
                    create: { collectionId: eventId, isApproved: true },
                  },
                },
              },
            },
            include: {
              orgMemberships: {
                include: { collectionMemberships: true },
              },
            },
          });

          invitedCollectionMembers.push(
            user.orgMemberships[0].collectionMemberships[0]
          );
        }
      }
      return invitedCollectionMembers;
    },
    inviteOrgMembers: async (
      parent,
      { orgId, emails: emailsString },
      { user }
    ) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        orgId,
        user,
      });

      if (!currentOrgMember?.isOrgAdmin)
        throw new Error("You need to be org. admin to invite members.");

      const emails = emailsString.split(",");

      if (emails.length > 1000)
        throw new Error("You can only invite 1000 people at a time");

      let newOrgMembers = [];

      for (const email of emails) {
        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });
        if (user) {
          const orgMember = await prisma.orgMember.findUnique({
            where: {
              organizationId_userId: {
                userId: user.id,
                organizationId: currentOrg.id,
              },
            },
          });
          if (!orgMember) {
            newOrgMembers.push(
              await prisma.orgMember.create({
                data: {
                  userId: user.id,
                  organizationId: currentOrgMember.organizationId,
                },
              })
            );
          }
        } else {
          const user = await prisma.user.create({
            data: {
              email: email.trim().toLowerCase(),
              orgMemberships: { create: { organizationId: currentOrg.id } },
            },
            include: { orgMemberships: true },
          });

          newOrgMembers.push(user.orgMemberships[0]);
        }
      }

      return newOrgMembers;
    },
    updateOrgMember: async (
      parent,
      { orgId, memberId, isOrgAdmin },
      { user }
    ) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        orgId,
        user,
      });

      if (!currentOrgMember?.isOrgAdmin)
        throw new Error("You need to be org admin to update member");

      const orgMember = await prisma.orgMember.findFirst({
        where: { id: memberId, organizationId: currentOrg.id },
      });

      if (!orgMember) throw new Error("No member to update found");

      if (typeof isOrgAdmin !== "undefined") {
        if (isOrgAdmin === false) {
          const orgAdmins = await prisma.orgMember.findMany({
            where: { organizationId: currentOrg.id, isOrgAdmin: true },
          });
          if (orgAdmins.length <= 1)
            throw new Error("You need at least 1 org admin");
        }
        orgMember.isOrgAdmin = isOrgAdmin;
      }
      return await prisma.orgMember.update({
        where: { id: orgMember.id },
        data: { ...orgMember },
      });
    },
    updateMember: async (
      parent,
      { eventId, memberId, isApproved, isAdmin, isGuide },
      { user }
    ) => {
      const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
        collectionId: eventId,
        user,
      });
      const currentEventMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: eventId,
          },
        },
      });

      if (
        !(
          (currentEventMember && currentEventMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to update member");

      const member = await prisma.collectionMember.update({
        where: { id: memberId },
        data: {
          ...(typeof isApproved !== "undefined" && { isApproved }),
          ...(typeof isAdmin !== "undefined" && { isAdmin }),
          ...(typeof isGuide !== "undefined" && { isGuide }),
        },
      });

      return member;
    },
    deleteMember: async (parent, { eventId, memberId }, { user }) => {
      const {
        currentOrg,
        currentOrgMember,
        collectionMember,
      } = await getCurrentOrgAndMember({
        collectionId: eventId,
        user,
      });

      if (
        !(
          (collectionMember && collectionMember.isAdmin) ||
          currentOrgMember.isOrgAdmin
        )
      )
        throw new Error("You need to be admin to delete member");

      return await prisma.collectionMember.deleteMany({
        where: { id: memberId, collectionId: eventId },
      });
    },
    deleteOrganization: async (parent, { organizationId }, { user }) => {
      const { currentOrgMember } = await getCurrentOrgAndMember({
        orgId: organizationId,
        user,
      });

      if (
        !(
          (currentOrgMember &&
            currentOrgMember.isOrgAdmin &&
            organizationId == currentOrgMember.organizationId) ||
          user.isRootAdmin
        )
      )
        throw new Error(
          "You need to be org. or root admin to delete an organization"
        );
      //TODO: turn into soft delete
      return prisma.organization.delete({ where: { id: organizationId } });
    },
    approveForGranting: async (parent, { dreamId, approved }, { user }) => {
      const { currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });

      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { cocreators: true, collection: true },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !collectionMember ||
        (!collectionMember.isAdmin && !collectionMember.isGuide)
      )
        throw new Error(
          "You need to be admin or guide to approve for granting"
        );

      const updated = await prisma.bucket.update({
        where: { id: dreamId },
        data: {
          approvedAt: approved ? new Date() : null,
          ...(approved && { canceledAt: null }),
        },
      });

      return updated;
    },
    allocate: async (
      _,
      { collectionId, collectionMemberId, amount, type },
      { user }
    ) => {
      const {
        currentOrgMember,
        collectionMember: currentCollectionMember,
      } = await getCurrentOrgAndMember({
        collectionId,
        user,
      });
      if (!currentOrgMember) throw new Error("You need to be logged in.");

      const targetCollectionMember = await prisma.collectionMember.findUnique({
        where: { id: collectionMemberId },
      });

      if (!currentCollectionMember?.isAdmin)
        throw new Error("You need to be collection admin to allocate funds.");

      await allocateToMember({
        collectionMemberId,
        collectionId: targetCollectionMember.collectionId,
        amount,
        type,
      });

      return targetCollectionMember;
    },
    bulkAllocate: async (_, { eventId, amount, type }, { user }) => {
      const {
        currentOrgMember,
        collectionMember,
      } = await getCurrentOrgAndMember({
        collectionId: eventId,
        user,
      });
      if (!currentOrgMember) throw new Error("You need to be logged in.");

      const eventMembers = await prisma.collectionMember.findMany({
        where: {
          collectionId: eventId,
          isApproved: true,
        },
      });

      if (!collectionMember?.isAdmin)
        throw new Error("You need to be collection admin to allocate funds.");

      for (const member of eventMembers) {
        await allocateToMember({
          collectionMemberId: member.id,
          collectionId: eventId,
          amount,
          type,
        });
      }

      return eventMembers;
    },
    contribute: async (_, { eventId, dreamId, amount }, { user }) => {
      const { currentOrgMember } = await getCurrentOrgAndMember({
        collectionId: eventId,
        user,
      });
      const currentCollectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: eventId,
          },
        },
        include: { collection: true },
      });

      const { collection } = currentCollectionMember;

      if (!currentCollectionMember || !currentCollectionMember.isApproved)
        throw new Error(
          "You need to be a logged in approved member to fund things"
        );

      if (amount <= 0) throw new Error("Value needs to be more than zero");

      // const event = await Event.findOne({ _id: eventId });

      // Check that granting is open
      const now = dayjs();
      const grantingHasOpened = collection.grantingOpens
        ? dayjs(collection.grantingOpens).isBefore(now)
        : true;
      const grantingHasClosed = collection.grantingCloses
        ? dayjs(collection.grantingCloses).isBefore(now)
        : false;
      const grantingIsOpen = grantingHasOpened && !grantingHasClosed;
      if (!grantingIsOpen) throw new Error("Granting is not open");

      let bucket = await prisma.bucket.findUnique({ where: { id: dreamId } });

      if (bucket.collectionId !== eventId)
        throw new Error("Bucket not in collection");

      if (!bucket.approvedAt)
        throw new Error("Bucket is not approved for granting");

      if (bucket.canceledAt)
        throw new Error("Funding has been canceled for bucket");

      if (bucket.fundedAt) throw new Error("Bucket has been funded");

      if (bucket.completedAt) throw new Error("Bucket is already completed");

      // Check that the max goal of the dream is not exceeded
      const {
        _sum: { amount: contributionsForBucket },
      } = await prisma.contribution.aggregate({
        where: { bucketId: bucket.id },
        _sum: { amount: true },
      });

      const budgetItems = await prisma.budgetItem.findMany({
        where: { bucketId: bucket.id, type: "EXPENSE" },
      });

      const maxGoal = budgetItems.reduce(
        (acc, item) => acc + (item.max ? item.max : item.min),
        0
      );

      if (contributionsForBucket + amount > maxGoal)
        throw new Error("You can't overfund this bucket.");

      // mark dream as funded if it has reached its max goal
      if (contributionsForBucket + amount === maxGoal) {
        bucket = await prisma.bucket.update({
          where: { id: dreamId },
          data: { fundedAt: new Date() },
        });
      }

      // Check that it is not more than is allowed per dream (if this number is set)
      const {
        _sum: { amount: contributionsFromUserToThisBucket },
      } = await prisma.contribution.aggregate({
        where: {
          bucketId: bucket.id,
          collectionMemberId: currentCollectionMember.id,
        },
        _sum: { amount: true },
      });

      if (
        collection.maxAmountToBucketPerUser &&
        amount + contributionsFromUserToThisBucket >
          collection.maxAmountToBucketPerUser
      ) {
        throw new Error(
          `You can give a maximum of ${
            collection.maxAmountToBucketPerUser / 100
          } ${collection.currency} to one dream`
        );
      }

      // Check that user has not spent more tokens than he has
      const {
        _sum: { amount: contributionsFromUser },
      } = await prisma.contribution.aggregate({
        where: {
          collectionMemberId: currentCollectionMember.id,
        },
        _sum: { amount: true },
      });

      const {
        _sum: { amount: allocationsForUser },
      } = await prisma.allocation.aggregate({
        where: {
          collectionMemberId: currentCollectionMember.id,
        },
        _sum: { amount: true },
      });

      if (contributionsFromUser + amount > allocationsForUser)
        throw new Error("You are trying to spend more than what you have.");

      await prisma.contribution.create({
        data: {
          collectionId: collection.id,
          collectionMemberId: currentCollectionMember.id,
          amount,
          bucketId: bucket.id,
        },
      });

      return bucket;
    },
    markAsCompleted: async (_, { dreamId }, { user }) => {
      const { currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      if (!currentOrgMember) {
        throw new Error("You need to be logged in.");
      }
      const bucket = await prisma.bucket.findUnique({ where: { id: dreamId } });

      const currentCollectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });
      if (
        !(currentCollectionMember?.isAdmin || currentCollectionMember?.isGuide)
      )
        throw new Error(
          "You need to be collection admin or guide to mark a bucket as completed"
        );

      const updated = await prisma.bucket.update({
        where: { id: bucket.id },
        data: { completedAt: new Date() },
      });
      return updated;
    },
    acceptFunding: async (_, { dreamId }, { user }) => {
      const { currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });

      if (!currentOrgMember) {
        throw new Error("You need to be logged in.");
      }

      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { cocreators: true },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !collectionMember ||
        (!bucket.cocreators.map((c) => c.id).includes(collectionMember.id) &&
          !collectionMember.isAdmin)
      )
        throw new Error("You are not an admin or cocreator of this bucket.");

      const {
        _sum: { amount: contributionsForBucket },
      } = await prisma.contribution.aggregate({
        where: { bucketId: bucket.id },
        _sum: { amount: true },
      });

      const {
        _sum: { min: minExpenses },
      } = await prisma.budgetItem.aggregate({
        where: { bucketId: bucket.id, type: "EXPENSE" },
        _sum: { min: true },
      });

      const {
        _sum: { min: minIncome },
      } = await prisma.budgetItem.aggregate({
        where: { bucketId: bucket.id, type: "INCOME" },
        _sum: { min: true },
      });

      const minGoal = minIncome - minExpenses;

      if (contributionsForBucket < minGoal)
        throw new Error("Bucket has not reached its minimum goal yet.");

      return prisma.bucket.update({
        where: { id: dreamId },
        data: { fundedAt: new Date() },
      });
    },
    cancelFunding: async (_, { dreamId }, { user }) => {
      const { currentOrgMember } = await getCurrentOrgAndMember({
        bucketId: dreamId,
        user,
      });
      if (!currentOrgMember) {
        throw new Error("You need to be logged in.");
      }
      const bucket = await prisma.bucket.findUnique({
        where: { id: dreamId },
        include: { cocreators: true },
      });

      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: bucket.collectionId,
          },
        },
      });

      if (
        !collectionMember ||
        (!bucket.cocreators.map((c) => c.id).includes(collectionMember.id) &&
          !collectionMember.isAdmin)
      )
        throw new Error("You are not an admin or cocreator of this bucket.");

      if (bucket.completedAt)
        throw new Error(
          "This bucket has already been marked completed, can't cancel funding."
        );

      const updated = await prisma.bucket.update({
        where: { id: dreamId },
        data: {
          fundedAt: null,
          approvedAt: null,
          canceledAt: new Date(),
          Contributions: { deleteMany: {} },
        },
      });

      // TODO: notify contribuors that they have been "re-imbursed"

      return updated;
    },
    updateGrantingSettings: async (
      parent,
      {
        eventId,
        currency,
        maxAmountToBucketPerUser,
        bucketCreationCloses,
        grantingOpens,
        grantingCloses,
        allowStretchGoals,
      },
      { user }
    ) => {
      const { currentOrgMember } = await getCurrentOrgAndMember({
        collectionId: eventId,
        user,
      });
      const eventMember = await prisma.collectionMember.findUnique({
        where: {
          orgMemberId_collectionId: {
            orgMemberId: currentOrgMember.id,
            collectionId: eventId,
          },
        },
        include: {
          collection: { include: { guidelines: true } },
        },
      });

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin to edit a guideline");

      if (
        !((eventMember && eventMember.isAdmin) || currentOrgMember.isOrgAdmin)
      )
        throw new Error("You need to be admin to update granting settings.");

      const grantingHasOpened = dayjs(
        eventMember.collection.grantingOpens
      ).isBefore(dayjs());

      if (currency && grantingHasOpened) {
        throw new Error("You can't change currency after granting has started");
      }

      return prisma.collection.update({
        where: { id: eventId },
        data: {
          ...(currency && { currency }),
          ...(typeof maxAmountToBucketPerUser !== "undefined" && {
            maxAmountToBucketPerUser,
          }),
          ...(typeof bucketCreationCloses !== "undefined" && {
            bucketCreationCloses,
          }),
          ...(typeof grantingOpens !== "undefined" && {
            grantingOpens,
          }),
          ...(typeof grantingCloses !== "undefined" && {
            grantingCloses,
          }),
          ...(typeof allowStretchGoals !== "undefined" && {
            allowStretchGoals,
          }),
        },
      });
    },
    registerForEvent: async (parent, { eventId }, { user }) => {
      if (!user) throw new Error("You need to be logged in.");

      const currentOrg = await prisma.organization.findFirst({
        where: { collections: { some: { id: eventId } } },
        include: {
          collections: { where: { id: eventId } },
          orgMembers: { where: { userId: user.id } },
        },
      });

      const collection = currentOrg.collections[0];
      const currentOrgMember = currentOrg.orgMembers?.[0];

      if (!currentOrg) throw new Error("There needs to be an org");

      if (collection.registrationPolicy === "INVITE_ONLY")
        throw new Error("This collection is invite only");

      const collectionMember = await prisma.collectionMember.create({
        data: {
          collection: { connect: { id: eventId } },
          orgMember: {
            connectOrCreate: {
              where: {
                id: currentOrgMember.id,
              },
              create: { organizationId: currentOrg.id, userId: user.id },
            },
          },
          isApproved:
            currentOrgMember?.isOrgAdmin ||
            collection.registrationPolicy === "OPEN",
        },
      });

      return collectionMember;
    },
  },
  Subscription: {
    commentsChanged: {
      subscribe: () => {}, //liveUpdate.asyncIterator(["commentsChanged"]),
    },
  },
  EventMember: {
    event: async (member) => {
      return await prisma.collection.findUnique({
        where: { id: member.collectionId },
      });
    },
    orgMember: async (member) => {
      return await prisma.orgMember.findUnique({
        where: { id: member.orgMemberId },
      });
    },
    balance: async (member) => {
      const {
        _sum: { amount: totalAllocations },
      } = await prisma.allocation.aggregate({
        where: { collectionMemberId: member.id },
        _sum: { amount: true },
      });

      const {
        _sum: { amount: totalContributions },
      } = await prisma.contribution.aggregate({
        where: { collectionMemberId: member.id },
        _sum: { amount: true },
      });

      return totalAllocations - totalContributions;
    },
  },
  OrgMember: {
    hasDiscourseApiKey: (orgMember) => !!orgMember.discourseApiKey,
    user: async (orgMember) => {
      return await prisma.user.findUnique({ where: { id: orgMember.userId } });
    },
    eventMemberships: async (orgMember) => {
      return await prisma.collectionMember.findMany({
        where: { orgMemberId: orgMember.id },
      });
    },
    currentEventMembership: async (orgMember, { collectionSlug }, { user }) => {
      if (!user) return null;

      if (!collectionSlug) return null;

      const collectionMember = await prisma.collectionMember.findFirst({
        where: {
          orgMember: { userId: user.id, id: orgMember.id },
          collection: { slug: collectionSlug },
        },
      });
      console.log({ collectionMember });
      return collectionMember;
    },
  },
  User: {
    // currentOrgMember: async (user, { orgSlug }, { user: currentUser }) => {
    //   return null;
    //   const currentOrgMember = await prisma.orgMember.findFirst({
    //     where: { organization: { slug: orgSlug }, userId: currentUser.id },
    //   });
    //   if (!currentOrgMember) return null;
    //   return user.id === currentOrgMember.userId ? currentOrgMember : null;
    // },
    orgMemberships: async (user) =>
      prisma.orgMember.findMany({ where: { userId: user.id } }),
    isRootAdmin: () => false, //TODO: add field in prisma
    avatar: () => null, //TODO: add avatars
  },
  Organization: {
    subdomain: (org) => org.slug,
    events: async (org) => {
      return await prisma.collection.findMany({
        where: { organizationId: org.id },
      });
    },
    discourseUrl: async (org) => {
      const discourseConfig = await prisma.discourseConfig.findFirst({
        where: { organizationId: org.id },
      });
      return discourseConfig?.url ?? null;
    },
    finishedTodos: async (org, args, { user }) => {
      return false;
      const currentOrgMember = await prisma.orgMember.findUnique({
        where: {
          organizationId_userId: { organizationId: org.id, userId: user.id },
        },
      });

      if (!(currentOrgMember && currentOrgMember.isOrgAdmin)) {
        // You need to be logged in as org admin
        return false;
      }

      return org.finishedTodos;
    },
  },
  Collection: {
    color: (collection) => collection.color ?? "anthracit",
    info: (collection) => {
      return collection.info && collection.info.length
        ? collection.info
        : `# Welcome to ${collection.title}`;
    },
    about: (collection) => {
      return collection.about && collection.about.length
        ? collection.about
        : `# About ${collection.title}`;
    },
    numberOfApprovedMembers: async (collection) => {
      return prisma.collectionMember.count({
        where: { collectionId: collection.id, isApproved: true },
      });
    },
    totalAllocations: async (collection) => {
      const {
        _sum: { amount },
      } = await prisma.allocation.aggregate({
        where: { collectionId: collection.id },
        _sum: { amount: true },
      });
      return amount;
    },
    totalContributions: async (collection) => {
      const {
        _sum: { amount },
      } = await prisma.contribution.aggregate({
        where: { collectionId: collection.id },
        _sum: { amount: true },
      });

      return amount;
    },
    totalContributionsFunding: async (collection) => {
      const fundingBuckets = await prisma.bucket.findMany({
        where: { collectionId: collection.id, fundedAt: null },
        select: { id: true },
      });
      const fundingBucketIds = fundingBuckets.map((bucket) => bucket.id);

      const {
        _sum: { amount: totalContributionsFunded },
      } = await prisma.contribution.aggregate({
        _sum: { amount: true },
        where: {
          collectionId: collection.id,
          bucketId: { in: fundingBucketIds },
        },
      });

      return totalContributionsFunded;
    },
    totalContributionsFunded: async (collection) => {
      const fundedBuckets = await prisma.bucket.findMany({
        where: { collectionId: collection.id, fundedAt: { not: null } },
        select: { id: true },
      });
      const fundedBucketIds = fundedBuckets.map((bucket) => bucket.id);

      const {
        _sum: { amount: totalContributionsFunded },
      } = await prisma.contribution.aggregate({
        _sum: { amount: true },
        where: {
          collectionId: collection.id,
          bucketId: { in: fundedBucketIds },
        },
      });

      return totalContributionsFunded;
    },
    totalInMembersBalances: async (collection) => {
      const {
        _sum: { amount: totalAllocations },
      } = await prisma.allocation.aggregate({
        where: { collectionId: collection.id },
        _sum: { amount: true },
      });

      const {
        _sum: { amount: totalContributions },
      } = await prisma.contribution.aggregate({
        where: { collectionId: collection.id },
        _sum: { amount: true },
      });

      return totalAllocations - totalContributions;
    },
    tags: async (collection) => {
      return prisma.tag.findMany({ where: { collectionId: collection.id } });
    },
    guidelines: async (collection) =>
      prisma.guideline.findMany({ where: { collectionId: collection.id } }),
    customFields: async (collection) =>
      prisma.field.findMany({ where: { collectionId: collection.id } }),
    grantingIsOpen: (collection) => {
      const now = dayjs();
      const grantingHasOpened = collection.grantingOpens
        ? dayjs(collection.grantingOpens).isBefore(now)
        : true;
      const grantingHasClosed = collection.grantingCloses
        ? dayjs(collection.grantingCloses).isBefore(now)
        : false;
      const grantingIsOpen = grantingHasOpened && !grantingHasClosed;
      return grantingIsOpen;
    },
    grantingHasClosed: (collection) => {
      return collection.grantingCloses
        ? dayjs(collection.grantingCloses).isBefore(dayjs())
        : false;
    },
    bucketCreationIsOpen: (collection) => {
      if (!collection.bucketCreationCloses) return true;

      const now = dayjs();
      const bucketCreationCloses = dayjs(collection.bucketCreationCloses);

      return now.isBefore(bucketCreationCloses);
    },
  },
  Dream: {
    cocreators: async (bucket) => {
      // const { cocreators } = await prisma.bucket.findUnique({
      //   where: { id: bucket.id },
      //   include: { cocreators: true },
      // });

      const cocreators = await prisma.collectionMember.findMany({
        where: { buckets: { some: { id: bucket.id } } },
      });
      return cocreators;
    },
    event: async (bucket) => {
      return prisma.collection.findUnique({
        where: { id: bucket.collectionId },
      });
    },
    totalContributions: async (bucket) => {
      const {
        _sum: { amount },
      } = await prisma.contribution.aggregate({
        _sum: { amount: true },
        where: {
          bucketId: bucket.id,
        },
      });
      return amount;
    },
    totalContributionsFromCurrentMember: async (bucket, args, { user }) => {
      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          organization: { collections: { some: { id: bucket.collectionId } } },
          userId: user.id,
        },
      });
      if (!currentOrgMember) {
        return 0;
      }
      const collectionMember = await prisma.collectionMember.findFirst({
        where: {
          orgMemberId: currentOrgMember.id,
          collectionId: bucket.collectionId,
        },
      });

      if (!collectionMember) return 0;

      // TODO: should it be initialized at 0 like below?
      const {
        _sum: { amount = 0 },
      } = await prisma.contribution.aggregate({
        _sum: { amount: true },
        where: {
          bucketId: bucket.id,
          collectionMemberId: collectionMember.id,
        },
      });
      return amount;
    },
    numberOfComments: async (bucket) => {
      // TODO: fix discourse check
      // Only display number of comments for non-Discourse orgs
      // if (orgHasDiscourse(currentOrg)) {
      //   return;
      // }

      return prisma.comment.count({ where: { bucketId: bucket.id } });
    },
    latestContributions: async (bucket) => {
      return await prisma.contribution.findMany({
        where: { bucketId: bucket.id },
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      });
    },
    noOfContributions: async (bucket) => {
      return await prisma.contribution.count({
        where: { bucketId: bucket.id },
      });
    },
    raisedFlags: async (bucket) => {
      const resolveFlags = await prisma.flag.findMany({
        where: { bucketId: bucket.id, type: "RESOLVE_FLAG" },
        select: { resolvingFlagId: true },
      });
      const resolveFlagIds = resolveFlags.map((flag) => flag.resolvingFlagId);

      return await prisma.flag.findMany({
        where: {
          bucketId: bucket.id,
          type: "RAISE_FLAG",
          id: { notIn: resolveFlagIds },
        },
      });
    },
    discourseTopicUrl: async (bucket) => {
      const org = await prisma.organization.findFirst({
        where: {
          collections: { some: { buckets: { some: { id: bucket.id } } } },
        },
        include: { discourse: true },
      });
      if (!bucket.discourseTopicId || !org?.discourse?.url) return null;

      return `${org.discourse.url}/t/${bucket.discourseTopicId}`;
    },
    tags: async (bucket) => {
      // TODO: verify
      return prisma.tag.findMany({
        where: { buckets: { some: { id: bucket.id } } },
      });
    },
    images: async (bucket) =>
      prisma.image.findMany({ where: { bucketId: bucket.id } }),
    customFields: async (bucket) =>
      prisma.fieldValue.findMany({ where: { bucketId: bucket.id } }),
    budgetItems: async (bucket) =>
      prisma.budgetItem.findMany({ where: { bucketId: bucket.id } }),
    published: (bucket) => !!bucket.publishedAt,
    approved: (bucket) => !!bucket.approvedAt,
    canceled: (bucket) => !!bucket.canceledAt,
    funded: (bucket) => !!bucket.fundedAt,
    completed: (bucket) => !!bucket.completedAt,
    income: async (bucket) => {
      const {
        _sum: { min },
      } = await prisma.budgetItem.aggregate({
        _sum: { min: true },
        where: {
          bucketId: bucket.id,
          type: "INCOME",
        },
      });
      return min;
    },
    minGoal: async (bucket) => {
      const {
        _sum: { min },
      } = await prisma.budgetItem.aggregate({
        _sum: { min: true },
        where: {
          bucketId: bucket.id,
          type: "EXPENSE",
        },
      });
      return min > 0 ? min : 0;
    },
    maxGoal: async (bucket) => {
      const {
        _sum: { min },
      } = await prisma.budgetItem.aggregate({
        _sum: { min: true },
        where: {
          bucketId: bucket.id,
          type: "EXPENSE",
        },
      });

      const budgetItems = await prisma.budgetItem.findMany({
        where: { bucketId: bucket.id, type: "EXPENSE" },
      });

      const maxGoal = budgetItems.reduce(
        (acc, item) => acc + (item.max ? item.max : item.min),
        0
      );

      return maxGoal > 0 && maxGoal !== min ? maxGoal : null;
    },
  },
  Transaction: {
    __resolveType(transaction) {
      if (transaction.bucketId) {
        return "Contribution";
      }
      return "Allocation"; // GraphQLError is thrown
    },
  },
  Contribution: {
    dream: async (contribution) => {
      return prisma.bucket.findUnique({
        where: { id: contribution.bucketId },
      });
    },
    event: async (contribution) => {
      return prisma.collection.findUnique({
        where: { id: contribution.collectionId },
      });
    },
    eventMember: async (contribution) => {
      return prisma.collectionMember.findUnique({
        where: { id: contribution.collectionMemberId },
      });
    },
  },
  Comment: {
    orgMember: async (comment) => {
      // make logs anonymous
      if (comment.isLog) return null;

      // TODO: fix this to be either colllectionMember or orgMember..
      if (comment.collectionMemberId)
        return prisma.orgMember.findFirst({
          where: {
            collectionMemberships: { some: { id: comment.collectionMemberId } },
          },
        });
    },
  },
  Flag: {
    guideline: async (flag) => {
      if (!flag.guidelineId) return null;
      return prisma.guideline.findUnique({ where: { id: flag.guidelineId } });
    },
    user: async () => {
      // see who left a flag
      // if not org admin or event admin or guide
      return null;
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
    customField: async (fieldValue) => {
      if (!fieldValue.fieldId) {
        return {
          id: "missing-" + fieldValue.id,
          name: "⚠️ Missing custom field ⚠️",
          description: "Custom field was removed",
          type: "TEXT",
          position: 1000,
          isRequired: false,
          createdAt: new Date(),
        };
      }

      const field = await prisma.field.findUnique({
        where: { id: fieldValue.fieldId },
      });

      return field;
    },
  },
};

export default resolvers;
