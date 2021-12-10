/*
  Warnings:

  - You are about to drop the column `isGuide` on the `CollectionMember` table. All the data in the column will be lost.
  - You are about to drop the column `orgMemberId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `orgMemberId` on the `Flag` table. All the data in the column will be lost.
  - You are about to drop the column `isOrgAdmin` on the `OrgMember` table. All the data in the column will be lost.
  - Added the required column `collMemberId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `collMemberId` to the `Flag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_orgMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Flag" DROP CONSTRAINT "Flag_orgMemberId_fkey";

-- DropIndex
DROP INDEX "CollectionMember_orgMemberId_collectionId_key";

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CollectionMember" DROP COLUMN "isGuide",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isModerator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "orgMemberId",
ADD COLUMN     "collMemberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Flag" DROP COLUMN "orgMemberId",
ADD COLUMN     "collMemberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrgMember"
RENAME COLUMN "isOrgAdmin" TO "isAdmin";

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_collMemberId_fkey" FOREIGN KEY ("collMemberId") REFERENCES "CollectionMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_collMemberId_fkey" FOREIGN KEY ("collMemberId") REFERENCES "CollectionMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
