import prisma from "server/prisma";

/**
 * Converts a status string to a Prisma query object
 */
export const statusTypeToQuery = (s: string) => {
  if (s === "PENDING_APPROVAL") {
    return { publishedAt: null };
  }
  if (s === "OPEN_FOR_FUNDING") {
    return { publishedAt: { not: null }, canceledAt: null, completedAt: null };
  }
  if (s === "FUNDED") {
    return { publishedAt: { not: null }, completedAt: null, canceledAt: null, funded: true };
  }
  if (s === "COMPLETED") {
    return { completedAt: { not: null } };
  }
  if (s === "CANCELED") {
    return { canceledAt: { not: null } };
  }
  return null;
};

/**
 * Computes a bucket's status based on its fields
 */
export const computeBucketStatus = (bucket: any) => {
  if (!bucket) return null;
  if (bucket.canceledAt) return "CANCELED";
  if (bucket.completedAt) return "COMPLETED";
  if (!bucket.publishedAt) return "PENDING_APPROVAL";
  if (bucket.funded) return "FUNDED";
  if (bucket.publishedAt) return "OPEN_FOR_FUNDING";
  return null;
};

export const markBucketAsFavorite = async ({
  bucketId,
  userId,
  reason,
}: {
  bucketId: string;
  userId: string;
  reason?: string;
}) => {
  const bucket = await prisma.bucket.findUnique({ where: { id: bucketId } });
  const roundMembership = await prisma.roundMember.findFirst({
    where: {
      userId: userId,
      roundId: bucket.roundId,
      hasJoined: true,
      isApproved: true,
    },
  });
  if (!roundMembership) {
    throw new Error(
      "You are not member of this round. Join this round to mark buckets as favorite."
    );
  }
  try {
    await prisma.favoriteBucket.create({
      data: {
        bucketId,
        roundMemberId: roundMembership.id,
        reason,
      },
    });
  } catch (err) {
    return err;
  }

  return bucket;
};

export const unmarkBucketAsFavorite = async ({
  bucketId,
  userId,
}: {
  bucketId: string;
  userId: string;
}) => {
  const bucket = await prisma.bucket.findUnique({ where: { id: bucketId } });
  const roundMembership = await prisma.roundMember.findUnique({
    where: {
      userId_roundId: {
        userId: userId,
        roundId: bucket.roundId,
      },
    },
  });

  await prisma.favoriteBucket.delete({
    where: {
      bucketId_roundMemberId: {
        bucketId: bucket.id,
        roundMemberId: roundMembership?.id,
      },
    },
  });

  return bucket;
};

export const isBucketFavorite = async ({
  bucketId,
  userId,
}: {
  bucketId: string;
  userId: string;
}) => {
  if (!userId) {
    return false;
  }
  const bucket = await prisma.bucket.findUnique({ where: { id: bucketId } });
  const roundMembership = await prisma.roundMember.findUnique({
    where: {
      userId_roundId: {
        userId: userId,
        roundId: bucket.roundId,
      },
    },
  });

  if (!roundMembership) {
    return false;
  }

  const row = await prisma.favoriteBucket.findUnique({
    where: {
      bucketId_roundMemberId: {
        bucketId,
        roundMemberId: roundMembership?.id,
      },
    },
    select: {
      id: true,
    },
  });
  return !!row;
};

export const getStarredBuckets = async ({
  userId,
  take,
  skip,
  roundId,
}: {
  userId: string;
  take: number;
  skip: number;
  roundId: string;
}) => {
  const memberships = await prisma.roundMember.findMany({
    where: {
      userId,
    },
  });
  let bucketIds = [];
  if (roundId) {
    const buckets = await prisma.bucket.findMany({
      where: {
        roundId,
      },
      select: {
        id: true,
      },
    });
    bucketIds = buckets.map((bucket) => bucket.id);
  }
  return prisma.favoriteBucket.findMany({
    where: {
      roundMemberId: {
        in: memberships.map((member) => member.id),
      },
      ...(roundId && {
        bucketId: {
          in: bucketIds,
        },
      }),
    },
    take,
    skip,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getStarredBucketsCount = async ({
  userId,
  take,
  skip,
}: {
  userId: string;
  take: number;
  skip: number;
}) => {
  const memberships = await prisma.roundMember.findMany({
    where: {
      userId,
      hasJoined: true,
      isApproved: true,
    },
  });
  return prisma.favoriteBucket.count({
    where: {
      roundMemberId: {
        in: memberships.map((member) => member.id),
      },
    },
  });
};
