/*
  Warnings:

  - You are about to drop the column `dreamCreationCloses` on the `Collection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bucket" ALTER COLUMN "discourseTopicId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "dreamCreationCloses",
ADD COLUMN     "bucketCreationCloses" TIMESTAMP(3);
