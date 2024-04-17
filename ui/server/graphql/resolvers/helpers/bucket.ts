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
