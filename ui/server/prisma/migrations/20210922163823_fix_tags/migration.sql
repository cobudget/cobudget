/*
  Warnings:

  - You are about to drop the column `bucketId` on the `Tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_bucketId_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "bucketId";

-- CreateTable
CREATE TABLE "_BucketToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BucketToTag_AB_unique" ON "_BucketToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_BucketToTag_B_index" ON "_BucketToTag"("B");

-- AddForeignKey
ALTER TABLE "_BucketToTag" ADD FOREIGN KEY ("A") REFERENCES "Bucket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BucketToTag" ADD FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
