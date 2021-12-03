/*
  Warnings:

  - You are about to drop the column `orgMemberId` on the `CollectionMember` table. All the data in the column will be lost.
  - You are about to drop the column `orgMemberId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `orgMemberId` on the `Flag` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `OrgMember` table. All the data in the column will be lost.
  - You are about to drop the column `isOrgAdmin` on the `OrgMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,collectionId]` on the table `CollectionMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `CollectionMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `collMemberId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `collMemberId` to the `Flag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionMember" DROP CONSTRAINT "CollectionMember_orgMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_orgMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Flag" DROP CONSTRAINT "Flag_orgMemberId_fkey";

-- DropIndex
DROP INDEX "CollectionMember_orgMemberId_collectionId_key";

-- AlterTable
ALTER TABLE "Collection" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CollectionMember" DROP COLUMN "orgMemberId",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "orgMemberId",
ADD COLUMN     "collMemberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Flag" DROP COLUMN "orgMemberId",
ADD COLUMN     "collMemberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrgMember" DROP COLUMN "bio",
DROP COLUMN "isOrgAdmin",
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "CollectionMember_userId_collectionId_key" ON "CollectionMember"("userId", "collectionId");

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_collMemberId_fkey" FOREIGN KEY ("collMemberId") REFERENCES "CollectionMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_collMemberId_fkey" FOREIGN KEY ("collMemberId") REFERENCES "CollectionMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
