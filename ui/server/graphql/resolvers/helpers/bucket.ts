import prisma from "server/prisma";

export const markBucketAsFavorite = async ({
  bucketId,
  userId,
}: {
  bucketId: string;
  userId: string;
}) => {
  const bucket = await prisma.bucket.findUnique({ where: { id: bucketId } });

  try {
    await prisma.favoriteBucket.create({
      data: {
        bucketId,
        userId,
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

  await prisma.favoriteBucket.delete({
    where: {
      bucketId_userId: {
        bucketId,
        userId,
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
  const row = await prisma.favoriteBucket.findFirst({
    where: {
      bucketId,
      userId,
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
}: {
  userId: string;
  take: number;
  skip: number;
}) => {
  return prisma.favoriteBucket.findMany({
    where: {
      userId,
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
  return prisma.favoriteBucket.count({
    where: {
      userId,
    },
    take,
    skip,
    orderBy: {
      createdAt: "desc",
    },
  });
};
