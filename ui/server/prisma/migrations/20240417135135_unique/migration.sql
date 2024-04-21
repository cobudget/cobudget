/*
  Warnings:

  - A unique constraint covering the columns `[bucketId,userId]` on the table `FavoriteBucket` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FavoriteBucket_bucketId_userId_key" ON "FavoriteBucket"("bucketId", "userId");
