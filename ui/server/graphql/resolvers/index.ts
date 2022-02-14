import SeededShuffle from "seededshuffle";
import slugify from "../../utils/slugify";
//import liveUpdate from "../../services/liveUpdate.service";
import prisma from "../../prisma";
import { GraphQLScalarType } from "graphql";
import GraphQLJSON from "graphql-type-json";
import { GraphQLJSONObject } from "graphql-type-json";
import { Kind } from "graphql/language";
import dayjs from "dayjs";
import { combineResolvers, skip } from "graphql-resolvers";
import discourse from "../../lib/discourse";
import { allocateToMember } from "../../controller";
import {
  orgHasDiscourse,
  generateComment,
} from "../../subscribers/discourse.subscriber";
import {
  bucketIncome,
  bucketMinGoal,
  bucketTotalContributions,
  getCollectionMember,
  getCurrentOrgAndMember,
  getOrgMember,
  isAndGetCollMember,
  isAndGetCollMemberOrOrgAdmin,
  isCollAdmin,
  isGrantingOpen,
  statusTypeToQuery,
} from "./helpers";
import { sendEmail } from "server/send-email";
import emailService from "server/services/EmailService/email.service";
import { CollectionTransaction } from "server/types";

const isRootAdmin = (parent, args, { user }) => {
  // TODO: this is old code that doesn't really work right now
  return user && user.isRootAdmin
    ? skip
    : new Error("You need to be root admin");
};

const isMemberOfOrg = async (parent, { orgId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");

  const currentOrgMember = await prisma.orgMember.findUnique({
    where: {
      organizationId_userId: { organizationId: orgId, userId: user.id },
    },
  });

  if (!currentOrgMember)
    throw new Error("You need to be a member of that organization");
  return skip;
};

const isCollMember = async (parent, { collectionId, bucketId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");
  const collectionMember = await getCollectionMember({
    userId: user.id,
    collectionId,
    bucketId,
  });
  // const collectionMember = await prisma.collectionMember.findUnique({
  //   where: { userId_collectionId: { userId: user.id, collectionId } },
  // });
  if (!collectionMember) {
    throw new Error("Collection member does not exist");
  } else if (!collectionMember.isApproved) {
    throw new Error("Collection member is not approved");
  } else if (!collectionMember.hasJoined) {
    throw new Error("Collection member has not accepted the invitation");
  }

  return skip;
};

const isCollMemberOrOrgAdmin = async (parent, { collectionId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");
  const collectionMember = await getCollectionMember({
    userId: user.id,
    collectionId,
  });
  let orgMember = null;
  if (!collectionMember) {
    const org = await prisma.organization.findFirst({
      where: { collections: { some: { id: collectionId } } },
    });
    orgMember = await getOrgMember({
      userId: user.id,
      orgId: org.id,
    });
  }

  if (!(collectionMember?.isApproved || orgMember?.isAdmin))
    throw new Error(
      "You need to be approved member of this collection or org admin to view collection members"
    );
  return skip;
};

const isCollOrOrgAdmin = async (parent, { collectionId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");
  const collectionMember = await getCollectionMember({
    userId: user.id,
    collectionId,
  });
  let orgMember = null;
  if (!collectionMember?.isAdmin) {
    const org = await prisma.organization.findFirst({
      where: { collections: { some: { id: collectionId } } },
    });
    orgMember = await getOrgMember({
      userId: user.id,
      orgId: org?.id,
    });
  }

  if (!(collectionMember?.isAdmin || orgMember?.isAdmin))
    throw new Error("You need to be admin of the collection or the org");
  return skip;
};

const isCollModOrAdmin = async (
  parent,
  { bucketId, collectionId },
  { user }
) => {
  if (!user) throw new Error("You need to be logged in");
  const collectionMember = await getCollectionMember({
    userId: user.id,
    bucketId,
    collectionId,
  });

  if (!(collectionMember?.isModerator || collectionMember?.isAdmin))
    throw new Error("You need to be admin or moderator of the collection");
  return skip;
};

const isOrgAdmin = async (parent, { orgId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");
  if (!orgId) return skip;
  const orgMember = await prisma.orgMember.findUnique({
    where: {
      organizationId_userId: { organizationId: orgId, userId: user.id },
    },
  });
  if (!orgMember?.isAdmin) throw new Error("You need to be org admin");
  return skip;
};

const isBucketCocreatorOrCollAdminOrMod = async (
  parent,
  { bucketId },
  { user }
) => {
  if (!user) throw new Error("You need to be logged in");
  if (!bucketId) throw new Error("You need to provide bucketId");

  const bucket = await prisma.bucket.findUnique({
    where: { id: bucketId },
    include: { cocreators: true, collection: true },
  });

  const collectionMember = await prisma.collectionMember.findUnique({
    where: {
      userId_collectionId: {
        userId: user.id,
        collectionId: bucket.collectionId,
      },
    },
  });

  if (
    !collectionMember ||
    (!bucket.cocreators.map((m) => m.id).includes(collectionMember.id) &&
      !collectionMember.isAdmin &&
      !collectionMember.isModerator)
  )
    throw new Error("You are not a cocreator of this bucket.");

  return skip;
};

const resolvers = {
  Query: {
    currentUser: async (parent, args, { user }) => {
      return user
        ? await prisma.user.findUnique({ where: { id: user.id } })
        : null;
    },
    user: async (parent, { userId }) => {
      // we let the resolvers grab any extra requested fields, so we don't accidentally leak e.g. emails
      return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
    },
    currentOrg: async (parent, { orgSlug }) => {
      if (!orgSlug || orgSlug === "c") return null;
      return prisma.organization.findUnique({ where: { slug: orgSlug } });
    },
    organization: combineResolvers(isMemberOfOrg, async (parent, { orgId }) => {
      return prisma.organization.findUnique({ where: { id: orgId } });
    }),
    organizations: combineResolvers(isRootAdmin, async (parent, args) => {
      return prisma.organization.findMany();
    }),
    collections: async (parent, { limit, orgId }, { user }) => {
      if (!orgId) return null;

      const currentOrgMember = user
        ? await prisma.orgMember.findUnique({
            where: {
              organizationId_userId: { organizationId: orgId, userId: user.id },
            },
          })
        : null;

      // if admin show all events (current or archived)
      if (currentOrgMember && currentOrgMember.isAdmin) {
        return prisma.collection.findMany({
          where: { organizationId: orgId, deleted: { not: true } },
          take: limit,
        });
      }

      return prisma.collection.findMany({
        where: {
          organizationId: orgId,
          archived: { not: true },
          deleted: { not: true },
        },
        take: limit,
      });
    },
    collection: async (parent, { orgSlug, collectionSlug }, { user }) => {
      if (!collectionSlug) return null;

      const collection = await prisma.collection.findFirst({
        where: {
          slug: collectionSlug,
          organization: { slug: orgSlug },
          deleted: { not: true },
        },
      });
      if (!collection) return null;

      if (collection.visibility === "PUBLIC") {
        return collection;
      }
      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          userId_collectionId: {
            userId: user?.id ?? "undefined",
            collectionId: collection.id,
          },
        },
      });

      if (collectionMember?.isApproved) {
        return collection;
      } else {
        return null;
      }
    },
    contributionsPage: combineResolvers(
      isCollMemberOrOrgAdmin,
      async (parent, { collectionId, offset, limit }) => {
        // const contributionsWithExtra = [
        //   ...(await Contribution.find({ collectionId }, null, {
        //     skip: offset,
        //     limit: limit + 1,
        //   }).sort({
        //     createdAt: -1,
        //   })),
        // ];

        const contributionsWithExtra = await prisma.contribution.findMany({
          where: { collectionId },
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
      }
    ),
    //here
    collectionTransactions: combineResolvers(
      isCollMemberOrOrgAdmin,
      async (parent, { collectionId, offset, limit }) => {
        const transactions: [CollectionTransaction] = await prisma.$queryRaw`
          (
            SELECT 
              "id", 
              "collectionMemberId", 
              null as "allocatedById", 
              "amount",
              "bucketId",
              "amountBefore", 
              null as "allocationType",
              'CONTRIBUTION' as "transactionType",
              "createdAt"
            FROM "Contribution" where "collectionId" = ${collectionId}
            
            UNION ALL
            
            SELECT 
              "id", 
              "collectionMemberId", 
              "allocatedById", 
              "amount",
              null as "bucketId",
              "amountBefore", 
              "allocationType",
              'ALLOCATION' as "transactionType",
              "createdAt"
            FROM "Allocation" where "collectionId" = ${collectionId}
          ) ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offset};
        `;

        transactions.forEach(
          (transaction) =>
            (transaction.createdAt = new Date(transaction.createdAt))
        );

        return {
          moreExist: transactions.length > limit,
          transactions: transactions.slice(0, limit),
        };
      }
    ),
    bucket: async (parent, { id }) => {
      const bucket = await prisma.bucket.findUnique({ where: { id } });
      if (bucket.deleted) return null;
      return bucket;
    },
    bucketsPage: async (
      parent,
      {
        collectionId,
        textSearchTerm,
        tag: tagValue,
        offset = 0,
        limit,
        status,
      },
      { user }
    ) => {
      const currentMember = await prisma.collectionMember.findUnique({
        where: {
          userId_collectionId: {
            userId: user?.id ?? "undefined",
            collectionId,
          },
        },
      });

      const isAdminOrGuide =
        currentMember && (currentMember.isAdmin || currentMember.isModerator);

      const statusFilter = status.map(statusTypeToQuery).filter((s) => s);

      const buckets = await prisma.bucket.findMany({
        where: {
          collectionId,
          deleted: { not: true },
          OR: statusFilter,
          ...(textSearchTerm && { title: { search: textSearchTerm } }),
          ...(tagValue && {
            tags: { some: { value: tagValue } },
          }),
          ...(!isAdminOrGuide &&
            (currentMember
              ? {
                  OR: [
                    { publishedAt: { not: null } },
                    { cocreators: { some: { id: currentMember.id } } },
                  ],
                }
              : { publishedAt: { not: null } })),
        },
      });

      const todaySeed = dayjs().format("YYYY-MM-DD");

      const shuffledBuckets = SeededShuffle.shuffle(
        buckets,
        user ? user.id + todaySeed : todaySeed
      );

      return {
        moreExist: shuffledBuckets.length > limit + offset,
        buckets: shuffledBuckets.slice(offset, limit + offset),
      };
    },
    orgMembersPage: combineResolvers(
      isOrgAdmin,
      async (parent, { offset = 0, limit, orgId }, { user }) => {
        const orgMembersWithExtra = await prisma.orgMember.findMany({
          where: { organizationId: orgId },
          skip: offset,
          take: limit + 1,
        });

        return {
          moreExist: orgMembersWithExtra.length > limit,
          orgMembers: orgMembersWithExtra.slice(0, limit),
        };
      }
    ),
    members: combineResolvers(
      isCollMemberOrOrgAdmin,
      async (parent, { collectionId, isApproved }) => {
        return await prisma.collectionMember.findMany({
          where: {
            collectionId,
            ...(typeof isApproved === "boolean" && { isApproved }),
          },
        });
      }
    ),
    membersPage: combineResolvers(
      isCollMemberOrOrgAdmin,
      async (
        parent,
        {
          collectionId,
          isApproved,
          usernameStartsWith,
          offset = 0,
          limit = 10,
        },
        { user }
      ) => {
        const isAdmin = await isCollAdmin({
          userId: user.id,
          collectionId,
        });

        const collectionMembersWithExtra = await prisma.collectionMember.findMany(
          {
            where: {
              collectionId,
              ...(typeof isApproved === "boolean" && { isApproved }),
              ...(usernameStartsWith && {
                user: { username: { startsWith: usernameStartsWith } },
              }),
              ...(!isAdmin && { hasJoined: true }),
            },
            take: limit + 1,
            skip: offset,
            ...(usernameStartsWith && { include: { user: true } }),
          }
        );

        return {
          moreExist: collectionMembersWithExtra.length > limit,
          members: collectionMembersWithExtra.slice(0, limit),
        };
      }
    ),
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
      { bucketId, from = 0, limit = 30, order = "desc" }
    ) => {
      const bucket = await prisma.bucket.findUnique({
        where: { id: bucketId },
        include: {
          comments: true,
          collection: {
            include: { organization: { include: { discourse: true } } },
          },
        },
      });
      // const dream = await Dream.findOne({ _id: bucketId });

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
              const author = await prisma.collectionMember.findFirst({
                where: {
                  collectionId: bucket.collectionId,
                  user: {
                    orgMemberships: {
                      some: {
                        discourseUsername: post.username,
                        organizationId: org.id,
                      },
                    },
                  },
                },
              });

              return generateComment(post, author);
            })
        );
      } else {
        comments = await prisma.comment.findMany({
          where: { bucketId: bucketId },
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
          orgMembers: { create: { userId: user.id, isAdmin: true } },
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
    editOrganization: combineResolvers(
      isOrgAdmin,
      async (parent, { orgId, name, info, slug, logo }, { user, eventHub }) => {
        if (name?.length === 0) throw new Error("Org name cannot be blank");
        if (slug?.length === 0)
          throw new Error("Org subdomain cannot be blank");
        if (info?.length > 500) throw new Error("Org info too long");

        const organization = await prisma.organization.update({
          where: {
            id: orgId,
          },
          data: {
            name,
            info,
            logo,
            slug: slug !== undefined ? slugify(slug) : undefined,
          },
        });

        // TODO: add back
        // await eventHub.publish("edit-organization", {
        //   currentOrg: organization,
        //   currentOrgMember,
        // });
        return organization;
      }
    ),
    setTodosFinished: combineResolvers(
      isOrgAdmin,
      async (parent, { orgId }) => {
        const org = await prisma.organization.update({
          where: { id: orgId },
          data: { finishedTodos: true },
        });
        return org;
      }
    ),
    createCollection: combineResolvers(
      isOrgAdmin,
      async (
        parent,
        { orgId, slug, title, currency, registrationPolicy },
        { user }
      ) => {
        let singleCollection = false;
        if (!orgId) {
          let rootOrg = await prisma.organization.findUnique({
            where: { slug: "c" },
          });
          if (!rootOrg) {
            rootOrg = await prisma.organization.create({
              data: { slug: "c", name: "Root" },
            });
          }
          orgId = rootOrg.id;
          singleCollection = true;
        }
        const collection = await prisma.collection.create({
          data: {
            slug,
            title,
            currency,
            registrationPolicy,
            organizationId: orgId,
            singleCollection,
            collectionMember: {
              create: {
                userId: user.id,
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

        // await eventHub.publish("create-event", {
        //   currentOrg,
        //   currentOrgMember,
        //   event: collection,
        // });

        return collection;
      }
    ),
    editCollection: combineResolvers(
      isCollOrOrgAdmin,
      async (
        parent,
        {
          collectionId,
          slug,
          title,
          archived,
          registrationPolicy,
          visibility,
          info,
          color,
          about,
          bucketReviewIsOpen,
          discourseCategoryId,
        }
      ) => {
        return prisma.collection.update({
          where: { id: collectionId },
          data: {
            ...(slug && { slug: slugify(slug) }),
            title,
            archived,
            registrationPolicy,
            visibility,
            info,
            about,
            color,
            bucketReviewIsOpen,
            discourseCategoryId,
          },
        });
      }
    ),
    deleteCollection: combineResolvers(
      isOrgAdmin,
      async (parent, { collectionId }) =>
        prisma.collection.update({
          where: { id: collectionId },
          data: { deleted: true },
        })
    ),
    addGuideline: combineResolvers(
      isCollOrOrgAdmin,
      async (parent, { collectionId, guideline: { title, description } }) => {
        const guidelines = await prisma.guideline.findMany({
          where: { collectionId: collectionId },
        });

        const position =
          guidelines
            .map((g) => g.position)
            .reduce((a, b) => Math.max(a, b), 1000) + 1;

        const guideline = await prisma.guideline.create({
          data: { collectionId: collectionId, title, description, position },
          include: { collection: true },
        });
        return guideline.collection;
      }
    ),
    editGuideline: combineResolvers(
      isCollOrOrgAdmin,
      async (
        parent,
        { collectionId, guidelineId, guideline: { title, description } }
      ) => {
        const collection = await prisma.collection.findUnique({
          where: { id: collectionId },
          include: { guidelines: true },
        });

        if (!collection.guidelines.map((g) => g.id).includes(guidelineId))
          throw new Error("This guideline is not part of this collection");

        const guideline = await prisma.guideline.update({
          where: { id: guidelineId },
          data: { title, description },
          include: { collection: true },
        });

        return guideline.collection;
      }
    ),
    setGuidelinePosition: combineResolvers(
      isCollOrOrgAdmin,
      async (parent, { collectionId, guidelineId, newPosition }, { user }) => {
        const collection = await prisma.collection.findUnique({
          where: { id: collectionId },
          include: { guidelines: true },
        });

        if (!collection.guidelines.map((g) => g.id).includes(guidelineId))
          throw new Error("This guideline is not part of this collection");

        const guideline = await prisma.guideline.update({
          where: { id: guidelineId },
          data: { position: newPosition },
          include: { collection: true },
        });

        return guideline.collection;
      }
    ),
    deleteGuideline: combineResolvers(
      isCollOrOrgAdmin,
      async (parent, { collectionId, guidelineId }) =>
        prisma.collection.update({
          where: { id: collectionId },
          data: { guidelines: { delete: { id: guidelineId } } },
        })
    ),
    addCustomField: combineResolvers(
      isCollOrOrgAdmin,
      async (
        parent,
        {
          collectionId,
          customField: { name, description, type, limit, isRequired },
        }
      ) => {
        const customFields = await prisma.field.findMany({
          where: { collectionId: collectionId },
        });

        const position =
          customFields
            .map((g) => g.position)
            .reduce((a, b) => Math.max(a, b), 1000) + 1;

        const customField = await prisma.field.create({
          data: {
            collectionId: collectionId,
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
      }
    ),
    // Based on https://softwareengineering.stackexchange.com/a/195317/54663
    setCustomFieldPosition: combineResolvers(
      isCollOrOrgAdmin,
      async (parent, { collectionId, fieldId, newPosition }) => {
        const collection = await prisma.collection.findUnique({
          where: { id: collectionId },
          include: { fields: true },
        });
        if (!collection.fields.map((g) => g.id).includes(fieldId))
          throw new Error("This field is not part of this collection");

        const field = await prisma.field.update({
          where: { id: fieldId },
          data: { position: newPosition },
          include: { collection: true },
        });

        return field.collection;
      }
    ),
    editCustomField: combineResolvers(
      isCollOrOrgAdmin,
      async (
        parent,
        {
          collectionId,
          fieldId,
          customField: { name, description, type, limit, isRequired },
        }
      ) => {
        const collection = await prisma.collection.findUnique({
          where: { id: collectionId },
          include: { fields: true },
        });
        if (!collection.fields.map((g) => g.id).includes(fieldId))
          throw new Error("This field is not part of this collection");

        const field = await prisma.field.update({
          where: { id: fieldId },
          data: { name, description, type, limit, isRequired },
          include: { collection: true },
        });

        return field.collection;
      }
    ),
    deleteCustomField: combineResolvers(
      isCollOrOrgAdmin,
      async (parent, { collectionId, fieldId }) =>
        prisma.collection.update({
          where: { id: collectionId },
          data: { fields: { delete: { id: fieldId } } },
        })
    ),
    createDream: combineResolvers(
      isCollMember,
      async (parent, { collectionId, title }, { user, eventHub }) => {
        const collection = await prisma.collection.findUnique({
          where: { id: collectionId },
          include: {
            organization: {
              include: { orgMembers: { where: { userId: user.id } } },
            },
          },
        });

        const currentOrgMember = collection?.organization?.orgMembers?.[0];

        const bucketCreationIsOpen = collection.bucketCreationCloses
          ? dayjs().isBefore(dayjs(collection.bucketCreationCloses))
          : true;

        if (!bucketCreationIsOpen)
          throw new Error("Bucket creation is not open");

        const bucket = await prisma.bucket.create({
          data: {
            collection: { connect: { id: collectionId } },
            title,
            cocreators: {
              connect: {
                userId_collectionId: { userId: user.id, collectionId },
              },
            },
          },
        });

        await eventHub.publish("create-dream", {
          currentOrg: collection.organization,
          currentOrgMember,
          dream: bucket,
          event: collection,
        });

        return bucket;
      }
    ),
    editDream: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (
        parent,
        { bucketId, title, description, summary, images, budgetItems },
        { user, eventHub }
      ) => {
        const updated = await prisma.bucket.update({
          where: { id: bucketId },
          data: {
            title,
            description,
            summary,
            ...(typeof budgetItems !== "undefined" && {
              BudgetItems: {
                deleteMany: {},
                createMany: { data: budgetItems },
              },
            }),
            ...(typeof images !== "undefined" && {
              Images: { deleteMany: {}, createMany: { data: images } },
            }),
          },
          include: {
            collection: {
              include: {
                organization: {
                  include: { orgMembers: { where: { userId: user.id } } },
                },
              },
            },
          },
        });

        await eventHub.publish("edit-dream", {
          currentOrg: updated.collection.organization,
          currentOrgMember: updated.collection.organization?.orgMembers?.[0],
          event: updated.collection,
          dream: updated,
        });

        return updated;
      }
    ),
    createTag: combineResolvers(
      isCollModOrAdmin,
      async (parent, { collectionId, tagValue }) => {
        return await prisma.collection.update({
          where: { id: collectionId },
          data: {
            tags: {
              create: {
                value: tagValue,
              },
            },
          },
        });
      }
    ),
    addTag: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (parent, { bucketId, tagId }) => {
        if (!tagId) throw new Error("You need to provide tag id");

        return await prisma.bucket.update({
          where: { id: bucketId },
          data: {
            tags: {
              connect: {
                id: tagId,
              },
            },
          },
        });
      }
    ),
    // removes a tag from all buckets it's added to, and then deletes it
    deleteTag: combineResolvers(
      isCollModOrAdmin,
      async (_, { collectionId, tagId }) => {
        // verify that the tag is part of this collection
        const tag = await prisma.tag.findUnique({
          where: {
            id: tagId,
          },
        });
        if (tag?.collectionId !== collectionId)
          throw new Error("Incorrect collection");

        await prisma.tag.delete({
          where: { id: tagId },
        });

        return await prisma.collection.findUnique({
          where: { id: collectionId },
          include: { tags: true },
        });
      }
    ),
    // removes a tag from a specific bucket
    removeTag: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId, tagId }) =>
        prisma.bucket.update({
          where: { id: bucketId },
          data: { tags: { disconnect: { id: tagId } } },
        })
    ),
    editDreamCustomField: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (
        parent,
        { bucketId, customField: { fieldId, value } },
        { user, eventHub }
      ) => {
        const updated = await prisma.bucket.update({
          where: { id: bucketId },
          data: {
            FieldValues: {
              upsert: {
                where: { bucketId_fieldId: { bucketId: bucketId, fieldId } },
                create: { fieldId, value },
                update: { value },
              },
            },
          },
          include: {
            collection: {
              include: {
                organization: {
                  include: { orgMembers: { where: { userId: user.id } } },
                },
              },
            },
          },
        });

        await eventHub.publish("edit-dream", {
          currentOrg: updated.collection.organization,
          currentOrgMember: updated.collection.organization?.orgMembers?.[0],
          event: updated.collection,
          dream: updated,
        });

        return updated;
      }
    ),
    deleteDream: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId }, { user, eventHub }) => {
        const {
          _sum: { amount: contributionsForBucket },
        } = await prisma.contribution.aggregate({
          where: { bucketId },
          _sum: { amount: true },
        });

        if (contributionsForBucket > 0) {
          throw new Error(
            "You cant delete a bucket that has received contributions"
          );
        }

        const bucket = await prisma.bucket.update({
          where: { id: bucketId },
          data: { deleted: true },
          include: {
            collection: {
              include: {
                organization: {
                  include: { orgMembers: { where: { userId: user.id } } },
                },
              },
            },
          },
        });

        await eventHub.publish("delete-dream", {
          currentOrg: bucket.collection.organization,
          currentOrgMember: bucket.collection.organization?.orgMembers?.[0],
          event: bucket.collection,
          dream: bucket,
        });

        return bucket;
      }
    ),
    addCocreator: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (parent, { bucketId, memberId }) =>
        prisma.bucket.update({
          where: { id: bucketId },
          data: {
            cocreators: {
              connect: { id: memberId },
            },
          },
        })
    ),
    removeCocreator: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId, memberId }) =>
        prisma.bucket.update({
          where: { id: bucketId },
          data: { cocreators: { disconnect: { id: memberId } } },
        })
    ),
    publishDream: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId, unpublish }, { user, eventHub }) => {
        const bucket = await prisma.bucket.findUnique({
          where: { id: bucketId },
          include: {
            collection: {
              include: {
                organization: {
                  include: { orgMembers: { where: { userId: user.id } } },
                },
              },
            },
          },
        });

        const publishedAt = unpublish ? null : new Date();
        const resultBucket = await prisma.bucket.update({
          where: { id: bucket.id },
          data: { publishedAt },
        });

        await eventHub.publish("publish-dream", {
          currentOrg: bucket.collection.organization,
          currentOrgMember: bucket.collection.organization?.orgMembers?.[0],
          event: bucket.collection,
          dream: bucket,
          unpublish,
        });

        return resultBucket;
      }
    ),
    addComment: combineResolvers(
      isCollMember,
      async (_, { content, bucketId }, { user, eventHub }) => {
        const bucket = await prisma.bucket.findUnique({
          where: { id: bucketId },
          include: {
            collection: {
              include: {
                collectionMember: { where: { userId: user.id } },
                organization: {
                  include: {
                    discourse: true,
                    orgMembers: { where: { userId: user.id } },
                  },
                },
              },
            },
          },
        });
        const currentOrg = bucket.collection.organization;
        const currentOrgMember = currentOrg?.orgMembers?.[0];
        const currentCollMember = bucket.collection.collectionMember?.[0];

        if (orgHasDiscourse(currentOrg) && !currentOrgMember.discourseApiKey) {
          throw new Error(
            "You need to have a discourse account connected, go to /connect-discourse"
          );
        }

        if (content.length < (currentOrg?.discourse?.minPostLength || 3)) {
          throw new Error(
            `Your post needs to be at least ${
              currentOrg.discourse?.minPostLength || 3
            } characters long!`
          );
        }

        const comment = { content, collMemberId: currentCollMember.id };

        const { discourse, prisma: prismaResult } = await eventHub.publish(
          "create-comment",
          {
            currentOrg,
            currentOrgMember,
            currentCollMember,
            currentUser: user,
            dream: bucket,
            event: bucket.collection,
            comment,
          }
        );

        return discourse || prismaResult;
      }
    ),

    deleteComment: combineResolvers(
      isCollMember,
      async (_, { bucketId, commentId }, { user, eventHub }) => {
        const bucket = await prisma.bucket.findUnique({
          where: { id: bucketId },
          include: {
            comments: { where: { id: commentId } },
            collection: {
              include: {
                collectionMember: { where: { userId: user.id } },
                organization: {
                  include: {
                    orgMembers: { where: { userId: user.id } },
                  },
                },
              },
            },
          },
        });
        const currentOrg = bucket.collection.organization;
        const currentOrgMember = currentOrg?.orgMembers?.[0];
        const currentCollMember = bucket.collection.collectionMember?.[0];
        const comment = bucket.comments?.[0];

        await eventHub.publish("delete-comment", {
          currentOrg,
          currentOrgMember,
          event: bucket.collection,
          currentCollMember,
          dream: bucket,
          comment,
        });

        return comment;
      }
    ),
    editComment: combineResolvers(
      isCollMember,
      async (parent, { bucketId, commentId, content }, { user, eventHub }) => {
        let comment = await prisma.comment.findUnique({
          where: { id: commentId },
          include: { bucket: { include: { collection: true } } },
        });
        comment = { ...comment, content };

        const currentCollMember = await prisma.collectionMember.findUnique({
          where: {
            userId_collectionId: {
              userId: user.id,
              collectionId: comment.bucket.collection.id,
            },
          },
          include: {
            user: true,
            collection: {
              include: {
                organization: {
                  include: { orgMembers: { where: { userId: user.id } } },
                },
              },
            },
          },
        });

        // TODO: permissions?
        //if (!collectionMember || comment.orgMemberId !== currentOrgMember)
        const { discourse, prisma: prismaResult } = await eventHub.publish(
          "edit-comment",
          {
            currentOrg: currentCollMember.collection.organization,
            currentOrgMember:
              currentCollMember.collection.organization?.orgMembers?.[0],
            currentCollMember,
            dream: comment.bucket,
            comment,
          }
        );
        return discourse || prismaResult;
      }
    ),
    raiseFlag: async (parent, { bucketId, guidelineId, comment }, { user }) => {
      const currentCollMember = await isAndGetCollMember({
        bucketId,
        userId: user.id,
      });

      // todo: check not already left a flag?
      const bucket = await prisma.bucket.findUnique({
        where: { id: bucketId },
        include: {
          collection: true,
        },
      });

      if (!bucket.collection.bucketReviewIsOpen || !bucket.publishedAt)
        throw new Error(
          "You can only review buckets when bucket review is open and the bucket is published"
        );

      if (!currentCollMember || !currentCollMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      let updated = await prisma.bucket.update({
        where: { id: bucketId },
        data: {
          flags: {
            create: {
              guidelineId,
              type: "RAISE_FLAG",
              collMemberId: currentCollMember.id,
              comment,
            },
          },
        },
        include: {
          collection: {
            include: {
              guidelines: { where: { id: guidelineId } },
              organization: { include: { discourse: true } },
            },
          },
        },
      });

      const logContent = `Someone flagged this dream for the **${updated.collection.guidelines[0].title}** guideline: \n> ${comment}`;
      const currentOrg = updated.collection.organization;
      if (orgHasDiscourse(currentOrg)) {
        if (!updated.discourseTopicId) {
          // TODO: break out create thread into separate function
          const discoursePost = await discourse(
            currentOrg.discourse
          ).posts.create(
            {
              title: bucket.title,
              raw: `https://${
                currentOrg.customDomain
                  ? currentOrg.customDomain
                  : `${currentOrg.slug}.${process.env.DEPLOY_URL}`
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
            where: { id: bucketId },
            data: { discourseTopicId: discoursePost.topic_id },
            include: {
              collection: {
                include: {
                  guidelines: { where: { id: guidelineId } },
                  organization: { include: { discourse: true } },
                },
              },
            },
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
            collMemberId: currentCollMember.id,
            bucketId,
          },
        });
      }

      return updated;
    },
    resolveFlag: async (parent, { bucketId, flagId, comment }, { user }) => {
      const currentCollMember = await isAndGetCollMember({
        bucketId,
        userId: user.id,
      });

      // todo: check not already left a flag?
      const bucket = await prisma.bucket.findUnique({
        where: { id: bucketId },
        include: {
          collection: true,
          flags: {
            where: { id: flagId },
            include: { guideline: true },
          },
        },
      });

      if (!bucket.collection.bucketReviewIsOpen || !bucket.publishedAt)
        throw new Error(
          "You can only review buckets when bucket review is open and the bucket is published"
        );

      if (!currentCollMember || !currentCollMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      let updated = await prisma.bucket.update({
        where: { id: bucketId },
        data: {
          flags: {
            create: {
              resolvingFlagId: flagId,
              type: "RESOLVE_FLAG",
              collMemberId: currentCollMember.id,
              comment,
            },
          },
        },
        include: {
          collection: {
            include: { organization: { include: { discourse: true } } },
          },
        },
      });
      const currentOrg = updated.collection.organization;
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
                  : `${currentOrg.slug}.${process.env.DEPLOY_URL}`
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
            where: { id: bucketId },
            data: { discourseTopicId: discoursePost.topic_id },
            include: {
              collection: {
                include: { organization: { include: { discourse: true } } },
              },
            },
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
            collMemberId: currentCollMember.id,
            bucketId: bucket.id,
          },
        });
      }

      return updated;
    },
    allGoodFlag: async (parent, { bucketId }, { user }) => {
      const currentCollMember = await isAndGetCollMember({
        bucketId,
        userId: user.id,
      });

      const bucket = await prisma.bucket.findUnique({
        where: { id: bucketId },
        include: {
          collection: true,
          flags: {
            where: {
              collMemberId: currentCollMember.id,
              type: "ALL_GOOD_FLAG",
            },
          },
        },
      });

      if (!bucket.collection.bucketReviewIsOpen || !bucket.publishedAt)
        throw new Error(
          "You can only review buckets when bucket review is open and the bucket is published"
        );

      if (bucket.flags.length) {
        return bucket;
        // TODO: update the ui to stop the user from doing this. in what way?
        //throw new Error("You have already left an all good flag");
      }

      return await prisma.bucket.update({
        where: { id: bucketId },
        data: {
          flags: {
            create: {
              type: "ALL_GOOD_FLAG",
              collMemberId: currentCollMember.id,
            },
          },
        },
      });
    },

    joinOrg: async (_, { orgId }, { user }) => {
      if (!user) throw new Error("You need to be logged in.");

      return await prisma.orgMember.create({
        data: { userId: user.id, organizationId: orgId },
      });
    },
    updateProfile: async (_, { name, username }, { user }) => {
      if (!user) throw new Error("You need to be logged in..");

      return prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          username,
        },
      });
    },
    updateBio: async (_, { collectionId, bio }, { user }) => {
      if (!user) throw new Error("You need to be logged in..");

      return prisma.collectionMember.update({
        where: { userId_collectionId: { userId: user.id, collectionId } },
        data: {
          bio,
        },
      });
    },
    inviteCollectionMembers: combineResolvers(
      isCollOrOrgAdmin,
      async (
        _,
        { emails: emailsString, collectionId },
        { user: currentUser }
      ) => {
        const collection = await prisma.collection.findUnique({
          where: { id: collectionId },
          include: { organization: true },
        });
        const emails = emailsString.split(",");

        if (emails.length > 1000)
          throw new Error("You can only invite 1000 people at a time");

        const invitedCollectionMembers = [];

        for (let email of emails) {
          email = email.trim().toLowerCase();

          const user = await prisma.user.findUnique({
            where: { email },
          });

          const updated = await prisma.user.upsert({
            where: { email },
            create: {
              email,
              collMemberships: {
                create: { isApproved: true, collectionId, hasJoined: false },
              },
            },
            update: {
              collMemberships: {
                connectOrCreate: {
                  create: { isApproved: true, collectionId, hasJoined: false },
                  where: {
                    userId_collectionId: {
                      userId: user?.id ?? "undefined",
                      collectionId,
                    },
                  },
                },
              },
            },
            include: { collMemberships: { where: { collectionId } } },
          });

          await emailService.inviteMember({ email, currentUser, collection });

          invitedCollectionMembers.push(updated.collMemberships?.[0]);
        }
        return invitedCollectionMembers;
      }
    ),
    inviteOrgMembers: combineResolvers(
      isOrgAdmin,
      async (_, { orgId, emails: emailsString }, { user: currentUser }) => {
        const emails: string[] = emailsString.split(",");

        if (emails.length > 1000)
          throw new Error("You can only invite 1000 people at a time");

        let newOrgMembers = [];

        for (let email of emails) {
          email = email.trim().toLowerCase();

          const user = await prisma.user.upsert({
            where: {
              email,
            },
            create: {
              orgMemberships: { create: { organizationId: orgId } },
              email,
            },
            update: {
              orgMemberships: {
                create: {
                  organizationId: orgId,
                },
              },
            },
            include: {
              orgMemberships: {
                where: { organizationId: orgId },
                include: { organization: true },
              },
            },
          });
          const orgMembership = user.orgMemberships?.[0];
          const currentOrg = orgMembership.organization;

          await emailService.inviteMember({ email, currentUser, currentOrg });

          newOrgMembers.push(orgMembership);
        }

        return newOrgMembers;
      }
    ),
    updateOrgMember: combineResolvers(
      isOrgAdmin,
      async (parent, { orgId, memberId, isAdmin }, { user }) => {
        const orgMember = await prisma.orgMember.findFirst({
          where: { id: memberId, organizationId: orgId },
        });

        if (!orgMember) throw new Error("No member to update found");

        if (typeof isAdmin !== "undefined") {
          if (isAdmin === false) {
            const orgAdmins = await prisma.orgMember.findMany({
              where: { organizationId: orgId, isAdmin: true },
            });
            if (orgAdmins.length <= 1)
              throw new Error("You need at least 1 org admin");
          }
          orgMember.isAdmin = isAdmin;
        }
        return await prisma.orgMember.update({
          where: { id: orgMember.id },
          data: { ...orgMember },
        });
      }
    ),
    updateMember: combineResolvers(
      isCollOrOrgAdmin,
      async (
        parent,
        { collectionId, memberId, isApproved, isAdmin, isModerator }
      ) => {
        const collectionMember = await prisma.collectionMember.findFirst({
          where: { collectionId, id: memberId },
        });
        if (!collectionMember)
          throw new Error("This member does not exist in this collection");

        return prisma.collectionMember.update({
          where: { id: memberId },
          data: {
            isApproved,
            isAdmin,
            isModerator,
          },
        });
      }
    ),
    deleteMember: combineResolvers(
      isCollOrOrgAdmin,
      async (parent, { collectionId, memberId }, { user }) => {
        const collectionMember = await prisma.collectionMember.findFirst({
          where: { collectionId, id: memberId },
        });
        if (!collectionMember)
          throw new Error("This member does not exist in this collection");

        return prisma.collectionMember.delete({
          where: { id: memberId },
        });
      }
    ),
    // deleteOrganization: async (parent, { organizationId }, { user }) => {
    //   const { currentOrgMember } = await getCurrentOrgAndMember({
    //     orgId: organizationId,
    //     user,
    //   });

    //   if (
    //     !(
    //       (currentOrgMember &&
    //         currentOrgMember.isAdmin &&
    //         organizationId == currentOrgMember.organizationId) ||
    //       user.isRootAdmin
    //     )
    //   )
    //     throw new Error(
    //       "You need to be org. or root admin to delete an organization"
    //     );
    //   //TODO: turn into soft delete
    //   return prisma.organization.delete({ where: { id: organizationId } });
    // },
    approveForGranting: combineResolvers(
      async (parent, args, ctx) => {
        const collection = await prisma.collection.findFirst({
          where: { buckets: { some: { id: args.bucketId } } },
        });

        return collection.requireBucketApproval
          ? isCollModOrAdmin(parent, args, ctx)
          : isBucketCocreatorOrCollAdminOrMod(parent, args, ctx);
      },
      async (_, { bucketId, approved }) =>
        prisma.bucket.update({
          where: { id: bucketId },
          data: {
            approvedAt: approved ? new Date() : null,
            ...(approved && { canceledAt: null }),
          },
        })
    ),
    allocate: async (_, { collectionMemberId, amount, type }, { user }) => {
      const targetCollectionMember = await prisma.collectionMember.findUnique({
        where: { id: collectionMemberId },
      });

      const currentCollMember = await prisma.collectionMember.findUnique({
        where: {
          userId_collectionId: {
            userId: user.id,
            collectionId: targetCollectionMember.collectionId,
          },
        },
      });

      if (!currentCollMember?.isAdmin)
        throw new Error("You are not admin for this collection");

      await allocateToMember({
        collectionMemberId,
        collectionId: targetCollectionMember.collectionId,
        amount,
        type,
        allocatedBy: currentCollMember.id,
      });

      return targetCollectionMember;
    },
    bulkAllocate: combineResolvers(
      isCollOrOrgAdmin,
      async (_, { collectionId, amount, type }, { user }) => {
        const collectionMembers = await prisma.collectionMember.findMany({
          where: {
            collectionId: collectionId,
            isApproved: true,
          },
        });
        //here
        const currentCollMember = await prisma.collectionMember.findUnique({
          where: {
            userId_collectionId: {
              userId: user.id,
              collectionId: collectionId,
            },
          },
        });

        for (const member of collectionMembers) {
          await allocateToMember({
            collectionMemberId: member.id,
            collectionId: collectionId,
            amount,
            type,
            allocatedBy: currentCollMember.id,
          });
        }

        return collectionMembers;
      }
    ),
    contribute: async (
      _,
      { collectionId, bucketId, amount },
      { user, eventHub }
    ) => {
      const collectionMember = await getCollectionMember({
        collectionId,
        userId: user.id,
        include: { collection: true },
      });

      const { collection } = collectionMember;

      if (amount <= 0) throw new Error("Value needs to be more than zero");

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

      let bucket = await prisma.bucket.findUnique({ where: { id: bucketId } });

      if (bucket.collectionId !== collectionId)
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
          where: { id: bucketId },
          data: { fundedAt: new Date() },
        });
      }

      // Check that it is not more than is allowed per dream (if this number is set)
      const {
        _sum: { amount: contributionsFromUserToThisBucket },
      } = await prisma.contribution.aggregate({
        where: {
          bucketId: bucket.id,
          collectionMemberId: collectionMember.id,
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
          collectionMemberId: collectionMember.id,
        },
        _sum: { amount: true },
      });

      const {
        _sum: { amount: allocationsForUser },
      } = await prisma.allocation.aggregate({
        where: {
          collectionMemberId: collectionMember.id,
        },
        _sum: { amount: true },
      });

      if (contributionsFromUser + amount > allocationsForUser)
        throw new Error("You are trying to spend more than what you have.");

      await prisma.contribution.create({
        data: {
          collectionId,
          collectionMemberId: collectionMember.id,
          amount,
          bucketId: bucket.id,
          amountBefore: contributionsForBucket || 0,
        },
      });

      await eventHub.publish("contribute-to-bucket", {
        collection,
        bucket,
        contributingUser: user,
        amount,
      });

      return bucket;
    },
    markAsCompleted: combineResolvers(
      isCollModOrAdmin,
      async (_, { bucketId }) =>
        prisma.bucket.update({
          where: { id: bucketId },
          data: { completedAt: new Date() },
        })
    ),
    acceptFunding: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId }) => {
        const {
          _sum: { amount: contributionsForBucket },
        } = await prisma.contribution.aggregate({
          where: { bucketId },
          _sum: { amount: true },
        });

        const {
          _sum: { min: minExpenses },
        } = await prisma.budgetItem.aggregate({
          where: { bucketId, type: "EXPENSE" },
          _sum: { min: true },
        });

        const {
          _sum: { min: minIncome },
        } = await prisma.budgetItem.aggregate({
          where: { bucketId, type: "INCOME" },
          _sum: { min: true },
        });

        const minGoal = minIncome - minExpenses;

        if (contributionsForBucket < minGoal)
          throw new Error("Bucket has not reached its minimum goal yet.");

        return prisma.bucket.update({
          where: { id: bucketId },
          data: { fundedAt: new Date() },
        });
      }
    ),
    cancelFunding: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId }, { eventHub }) => {
        const bucket = await prisma.bucket.findUnique({
          where: { id: bucketId },
          include: {
            cocreators: true,
            collection: { include: { organization: true } },
            Contributions: {
              include: { collectionMember: { include: { user: true } } },
            },
          },
        });

        if (bucket.completedAt)
          throw new Error(
            "This bucket has already been marked completed, can't cancel funding."
          );

        const updated = await prisma.bucket.update({
          where: { id: bucketId },
          data: {
            fundedAt: null,
            approvedAt: null,
            canceledAt: new Date(),
            Contributions: { deleteMany: {} },
          },
        });

        await eventHub.publish("cancel-funding", {
          bucket,
        });

        return updated;
      }
    ),
    updateGrantingSettings: combineResolvers(
      isCollOrOrgAdmin,
      async (
        parent,
        {
          collectionId,
          currency,
          maxAmountToBucketPerUser,
          bucketCreationCloses,
          grantingOpens,
          grantingCloses,
          allowStretchGoals,
          requireBucketApproval,
        }
      ) => {
        const collection = await prisma.collection.findUnique({
          where: { id: collectionId },
        });
        const grantingHasOpened = dayjs(collection.grantingOpens).isBefore(
          dayjs()
        );

        if (currency && grantingHasOpened) {
          throw new Error(
            "You can't change currency after granting has started"
          );
        }

        return prisma.collection.update({
          where: { id: collectionId },
          data: {
            currency,
            maxAmountToBucketPerUser,
            bucketCreationCloses,
            grantingOpens,
            grantingCloses,
            allowStretchGoals,
            requireBucketApproval,
          },
        });
      }
    ),
    acceptInvitation: async (parent, { collectionId }, { user }) => {
      if (!user) throw new Error("You need to be logged in.");

      const member = await getCollectionMember({
        collectionId,
        userId: user.id,
      });

      if (!member) {
        throw new Error("You are not a member of this collection");
      }

      if (member.hasJoined) {
        throw new Error("Invitation not pending");
      }

      return prisma.collectionMember.update({
        where: { id: member.id },
        data: {
          hasJoined: true,
        },
      });
    },
    joinCollection: async (parent, { collectionId }, { user }) => {
      if (!user) throw new Error("You need to be logged in.");

      const currentOrgMember = await prisma.orgMember.findFirst({
        where: {
          userId: user.id,
          organization: { collections: { some: { id: collectionId } } },
        },
      });

      const collection = await prisma.collection.findUnique({
        where: { id: collectionId },
      });

      if (
        !currentOrgMember?.isAdmin &&
        collection.registrationPolicy === "INVITE_ONLY"
      )
        throw new Error("This collection is invite only");

      const collectionMember = await prisma.collectionMember.create({
        data: {
          collectionId,
          userId: user.id,
          isApproved:
            currentOrgMember?.isAdmin ||
            collection.registrationPolicy === "OPEN",
        },
      });

      return collectionMember;
    },
  },
  CollectionMember: {
    collection: async (member) => {
      return await prisma.collection.findUnique({
        where: { id: member.collectionId },
      });
    },
    user: async (member) =>
      prisma.user.findUnique({
        where: { id: member.userId },
      }),
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
    email: async (member, _, { user }) => {
      if (!user) return null;
      const currentCollMember = await prisma.collectionMember.findUnique({
        where: {
          userId_collectionId: {
            userId: user.id,
            collectionId: member.collectionId,
          },
        },
      });

      if (!(currentCollMember?.isAdmin || currentCollMember.id == member.id))
        return null;

      const u = await prisma.user.findFirst({
        where: {
          collMemberships: {
            some: { id: member.id },
          },
        },
      });
      return u.email;
    },
    name: async (member, _, { user }) => {
      if (!user) return null;
      const currentCollMember = await prisma.collectionMember.findUnique({
        where: {
          userId_collectionId: {
            userId: user.id,
            collectionId: member.collectionId,
          },
        },
      });

      if (!(currentCollMember?.isAdmin || currentCollMember.id == member.id))
        return null;

      const u = await prisma.user.findFirst({
        where: {
          collMemberships: {
            some: { id: member.id },
          },
        },
      });
      return u.name;
    },
  },
  OrgMember: {
    hasDiscourseApiKey: (orgMember) => !!orgMember.discourseApiKey,
    user: async (orgMember) => {
      return await prisma.user.findUnique({ where: { id: orgMember.userId } });
    },
    email: async (member, _, { user }) => {
      if (!user) return null;
      const currentOrgMember = await prisma.orgMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: member.organizationId,
            userId: user.id,
          },
        },
      });

      if (!(currentOrgMember?.isAdmin || currentOrgMember.id == member.id))
        return null;

      const u = await prisma.user.findFirst({
        where: {
          orgMemberships: {
            some: { id: member.id },
          },
        },
      });
      return u.email;
    },
    name: async (member, _, { user }) => {
      if (!user) return null;
      const currentOrgMember = await prisma.orgMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: member.organizationId,
            userId: user.id,
          },
        },
      });

      if (!(currentOrgMember?.isAdmin || currentOrgMember.id == member.id))
        return null;

      const u = await prisma.user.findFirst({
        where: {
          orgMemberships: {
            some: { id: member.id },
          },
        },
      });
      return u.name;
    },
    organization: async (orgMember) =>
      prisma.organization.findUnique({
        where: { id: orgMember.organizationId },
      }),
  },
  User: {
    currentOrgMember: async (parent, { orgSlug }, { user }) => {
      if (user?.id !== parent.id) return null;
      if (!orgSlug) return null;
      return prisma.orgMember.findFirst({
        where: { organization: { slug: orgSlug }, userId: user.id },
      });
    },
    currentCollMember: async (
      parent,
      { orgSlug, collectionSlug },
      { user }
    ) => {
      if (user?.id !== parent.id) return null;
      if (!collectionSlug) return null;
      return prisma.collectionMember.findFirst({
        where: {
          collection: {
            slug: collectionSlug,
            organization: { slug: orgSlug },
          },
          userId: user.id,
        },
      });
    },
    orgMemberships: async (user) =>
      prisma.orgMember.findMany({ where: { userId: user.id } }),
    collectionMemberships: async (user) =>
      prisma.collectionMember.findMany({
        where: { userId: user.id, collection: { isNot: { deleted: true } } },
      }),
    isRootAdmin: () => false, //TODO: add field in prisma
    avatar: () => null, //TODO: add avatars
    email: (parent, _, { user }) => {
      if (!user) return null;
      if (parent.id !== user.id) return null;
      if (parent.email) return parent.email;
    },
    name: async (parent, _, { user }) => {
      if (!user) return null;
      if (parent.id !== user.id) return null;
      if (parent.name) return parent.name;
      // we end up here when requesting your own name but it's missing on the parent
      return (
        await prisma.user.findUnique({
          where: { id: parent.id },
          select: { name: true },
        })
      ).name;
    },
    username: async (parent) => {
      if (parent.id) {
        return (
          await prisma.user.findUnique({
            where: { id: parent.id },
            select: { username: true },
          })
        ).username;
      }
    },
  },
  Organization: {
    info: (org) => {
      return org.info && org.info.length
        ? org.info
        : `# Welcome to ${org.name}`;
    },
    subdomain: (org) => org.slug,
    collections: async (org, args, { user }) => {
      return await prisma.collection.findMany({
        where: {
          OR: [
            {
              organizationId: org.id,
              visibility: "PUBLIC",
            },
            {
              organizationId: org.id,
              collectionMember: {
                some: { userId: user?.id ?? "undefined", isApproved: true },
              },
            },
          ],
        },
      });
    },
    discourseUrl: async (org) => {
      const discourseConfig = await prisma.discourseConfig.findFirst({
        where: { organizationId: org.id },
      });
      return discourseConfig?.url ?? null;
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
      return isGrantingOpen(collection);
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
    organization: async (collection) => {
      if (collection.singleCollection) return null;
      return prisma.organization.findUnique({
        where: { id: collection.organizationId },
      });
    },
    bucketStatusCount: async (collection) => {
      return {
        PENDING_APPROVAL: await prisma.bucket.count({
          where: {
            collectionId: collection.id,
            ...statusTypeToQuery("PENDING_APPROVAL"),
          },
        }),
        OPEN_FOR_FUNDING: await prisma.bucket.count({
          where: {
            collectionId: collection.id,
            ...statusTypeToQuery("OPEN_FOR_FUNDING"),
          },
        }),
        FUNDED: await prisma.bucket.count({
          where: {
            collectionId: collection.id,
            ...statusTypeToQuery("FUNDED"),
          },
        }),
        CANCELED: await prisma.bucket.count({
          where: {
            collectionId: collection.id,
            ...statusTypeToQuery("CANCELED"),
          },
        }),
        COMPLETED: await prisma.bucket.count({
          where: {
            collectionId: collection.id,
            ...statusTypeToQuery("COMPLETED"),
          },
        }),
      };
    },
  },
  Bucket: {
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
    collection: async (bucket) => {
      return prisma.collection.findUnique({
        where: { id: bucket.collectionId },
      });
    },
    totalContributions: async (bucket) => {
      return bucketTotalContributions(bucket);
    },
    totalContributionsFromCurrentMember: async (bucket, args, { user }) => {
      if (!user) return null;
      const collectionMember = await prisma.collectionMember.findUnique({
        where: {
          userId_collectionId: {
            userId: user.id,
            collectionId: bucket.collectionId,
          },
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
    noOfComments: async (bucket) => {
      // TODO: fix discourse check
      // Only display number of comments for non-Discourse orgs
      // if (orgHasDiscourse(currentOrg)) {
      //   return;
      // }

      return prisma.comment.count({ where: { bucketId: bucket.id } });
    },
    contributions: async (bucket) => {
      return await prisma.contribution.findMany({
        where: { bucketId: bucket.id },
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
    funders: async (bucket) => {
      const funders = await prisma.contribution.groupBy({
        where: { bucketId: bucket.id },
        by: ["collectionMemberId"],
        _sum: {
          amount: true,
        },
      });
      const contributionsFormat = funders.map((funder) => ({
        id: funder.collectionMemberId,
        collectionId: bucket.collectionId,
        collectionMemberId: funder.collectionMemberId,
        bucketId: bucket.id,
        amount: funder._sum.amount,
        createdAt: new Date(),
      }));
      return contributionsFormat;
    },
    noOfFunders: async (bucket) => {
      const funders = await prisma.contribution.groupBy({
        where: { bucketId: bucket.id },
        by: ["collectionMemberId"],
      });
      return funders.length;
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
      return bucketIncome(bucket);
    },
    minGoal: async (bucket) => {
      return bucketMinGoal(bucket);
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
    status: (bucket, args, ctx) => {
      if (bucket.completedAt) return "COMPLETED";
      if (bucket.canceledAt) return "CANCELED";
      if (bucket.fundedAt) return "FUNDED";
      if (bucket.approvedAt) return "OPEN_FOR_FUNDING";
      return "PENDING_APPROVAL";
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
    bucket: async (contribution) => {
      return prisma.bucket.findUnique({
        where: { id: contribution.bucketId },
      });
    },
    collection: async (contribution) => {
      return prisma.collection.findUnique({
        where: { id: contribution.collectionId },
      });
    },
    collectionMember: async (contribution) => {
      return prisma.collectionMember.findUnique({
        where: { id: contribution.collectionMemberId },
      });
    },
  },
  CollectionTransaction: {
    collectionMember: async (transaction) => {
      return prisma.collectionMember.findUnique({
        where: { id: transaction.collectionMemberId },
      });
    },
    allocatedBy: async (transaction) => {
      if (transaction.allocatedById)
        return prisma.collectionMember.findUnique({
          where: { id: transaction.allocatedById },
        });
      else return null;
    },
    bucket: async (transaction) => {
      if (transaction.bucketId)
        return prisma.bucket.findUnique({
          where: { id: transaction.bucketId },
        });
      else return null;
    },
    collection: async (transaction) => {
      return prisma.collection.findUnique({
        where: { id: transaction.collectionId },
      });
    },
  },
  Comment: {
    collectionMember: async (comment) => {
      // make logs anonymous
      if (comment.isLog) return null;

      return prisma.collectionMember.findUnique({
        where: {
          id: comment.collMemberId,
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
