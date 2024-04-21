-- CreateTable
CREATE TABLE "FavoriteBucket" (
    "id" TEXT NOT NULL,
    "bucketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteBucket_pkey" PRIMARY KEY ("id")
);
