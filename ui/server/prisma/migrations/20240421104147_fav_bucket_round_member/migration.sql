/*
  Warnings:

  - You are about to drop the column `userId` on the `FavoriteBucket` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bucketId,roundMemberId]` on the table `FavoriteBucket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roundMemberId` to the `FavoriteBucket` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "FavoriteBucket_bucketId_userId_key";

-- AlterTable
ALTER TABLE "FavoriteBucket" DROP COLUMN "userId",
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "roundMemberId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteBucket_bucketId_roundMemberId_key" ON "FavoriteBucket"("bucketId", "roundMemberId");

-- AddForeignKey
ALTER TABLE "FavoriteBucket" ADD CONSTRAINT "FavoriteBucket_roundMemberId_fkey" FOREIGN KEY ("roundMemberId") REFERENCES "CollectionMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
