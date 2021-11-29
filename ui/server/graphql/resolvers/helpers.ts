import prisma from "../../prisma";

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
            include: { collectionMemberships: { where: { collectionId } } },
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

// const { currentOrg, currentOrgMember } = await getCurrentOrgAndMember({
//   orgId,
//   user,
// });
