import prisma from "../../prisma";

export async function getCurrentCollMember({ collMemberId }) {}

export async function isAndGetCollMember({
  collectionId,
  userId,
  bucketId,
  include,
}: {
  collectionId?: string;
  bucketId?: string;
  userId?: string;
  include?: object;
}) {
  let collMember = null;
  if (bucketId) {
    collMember = await prisma.collectionMember.findFirst({
      where: { buckets: { some: { id: bucketId } } },
      include,
    });
  } else if (collectionId) {
    collMember = await prisma.collectionMember.findUnique({
      where: {
        userId_collectionId: { userId, collectionId },
      },
      include,
    });
  }

  if (!collMember?.isApproved)
    throw new Error("Non existing or non approved collection member");

  return collMember;
}

export async function isAndGetCollMemberOrOrgAdmin({
  collectionId,
  userId,
  bucketId,
  include,
}: {
  collectionId?: string;
  bucketId?: string;
  userId?: string;
  include?: object;
}) {
  let collMember = null;
  let orgMember = null;

  if (bucketId) {
    collMember = await prisma.collectionMember.findFirst({
      where: { buckets: { some: { id: bucketId } } },
      include,
    });
  } else if (collectionId) {
    collMember = await prisma.collectionMember.findUnique({
      where: {
        userId_collectionId: { userId, collectionId },
      },
      include,
    });
  }
  if (!collMember) {
    orgMember = await prisma.orgMember.findFirst({
      where: { organization: { collections: { some: { id: collectionId } } } },
    });
  }

  if (!orgMember?.isAdmin || !collMember?.isApproved)
    throw new Error("Not a collection member or an org admin");

  return { collMember, orgMember };
}

export async function getOrgMember({ orgId, userId }) {
  return await prisma.orgMember.findUnique({
    where: {
      organizationId_userId: { userId, organizationId: orgId },
    },
  });
}

export async function getCollectionMember({
  collectionId,
  userId,
  include,
  bucketId,
}: {
  collectionId?: string;
  userId: string;
  include?: object;
  bucketId?: string;
}) {
  let collMember = null;

  if (bucketId) {
    collMember = await prisma.collectionMember.findFirst({
      where: { buckets: { some: { id: bucketId } } },
      include,
    });
  } else if (collectionId) {
    collMember = await prisma.collectionMember.findUnique({
      where: {
        userId_collectionId: { userId, collectionId },
      },
      include,
    });
  }
  if (!collMember?.isApproved) {
    throw new Error("Not a collection member ");
  }

  return collMember;
}

export async function getCurrentOrgAndMember({
  orgId,
  collectionId,
  bucketId,
  user,
}: {
  orgId?: string;
  collectionId?: string;
  bucketId?: string;
  user?: any;
}) {
  let currentOrg = null;

  const include = {
    ...(user && {
      orgMembers: { where: { userId: user.id }, include: { user: true } },
    }),
    discourse: true,
  };

  if (orgId) {
    currentOrg = await prisma.organization.findUnique({
      where: { id: orgId },
      include,
    });
  } else if (collectionId) {
    currentOrg = await prisma.organization.findFirst({
      where: { collections: { some: { id: collectionId } } },
      include: {
        ...(user && {
          orgMembers: {
            where: { userId: user.id },
          },
        }),
        discourse: true,
      },
    });
  } else if (bucketId) {
    currentOrg = await prisma.organization.findFirst({
      where: { collections: { some: { buckets: { some: { id: bucketId } } } } },
      include,
    });
  }

  const currentOrgMember = currentOrg?.orgMembers?.[0];
  const collectionMember = currentOrgMember?.collectionMemberships?.[0];
  return { currentOrg, currentOrgMember, collectionMember };
}
