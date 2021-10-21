/*
  Warnings:

  - You are about to drop the column `collectionMemberId` on the `Comment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_collectionMemberId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "collectionMemberId",
ADD COLUMN     "orgMemberId" TEXT;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_orgMemberId_fkey" FOREIGN KEY ("orgMemberId") REFERENCES "OrgMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
