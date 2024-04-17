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
