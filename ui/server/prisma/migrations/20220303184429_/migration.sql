/*
  Warnings:

  - You are about to drop the column `collectionId` on the `Allocation` table. All the data in the column will be lost.
  - You are about to drop the column `collectionMemberId` on the `Allocation` table. All the data in the column will be lost.
  - You are about to drop the column `collectionId` on the `Bucket` table. All the data in the column will be lost.
  - You are about to drop the column `collectionId` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `collectionMemberId` on the `Contribution` table. All the data in the column will be lost.
  - You are about to drop the column `collectionId` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `collectionId` on the `Guideline` table. All the data in the column will be lost.
  - You are about to drop the column `collectionId` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `collectionId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `collectionMemberId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `Collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollectionMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BucketToCollectionMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roundId,value]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roundId` to the `Allocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundMemberId` to the `Allocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundId` to the `Bucket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundId` to the `Contribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundMemberId` to the `Contribution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundId` to the `Field` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundId` to the `Guideline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roundId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Allocation" DROP CONSTRAINT "Allocation_allocatedById_fkey";

-- DropForeignKey
ALTER TABLE "Allocation" DROP CONSTRAINT "Allocation_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Allocation" DROP CONSTRAINT "Allocation_collectionMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Bucket" DROP CONSTRAINT "Bucket_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionMember" DROP CONSTRAINT "CollectionMember_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionMember" DROP CONSTRAINT "CollectionMember_incomingAccountId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionMember" DROP CONSTRAINT "CollectionMember_outgoingAccountId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionMember" DROP CONSTRAINT "CollectionMember_statusAccountId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionMember" DROP CONSTRAINT "CollectionMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_collMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_collectionMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Field" DROP CONSTRAINT "Field_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Flag" DROP CONSTRAINT "Flag_collMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Guideline" DROP CONSTRAINT "Guideline_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_collectionMemberId_fkey";

-- DropForeignKey
ALTER TABLE "_BucketToCollectionMember" DROP CONSTRAINT "_BucketToCollectionMember_A_fkey";

-- DropForeignKey
ALTER TABLE "_BucketToCollectionMember" DROP CONSTRAINT "_BucketToCollectionMember_B_fkey";

-- DropIndex
DROP INDEX "Tag_collectionId_value_key";

-- AlterTable
ALTER TABLE "Allocation" DROP COLUMN "collectionId",
DROP COLUMN "collectionMemberId",
ADD COLUMN     "roundId" TEXT NOT NULL,
ADD COLUMN     "roundMemberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Bucket" DROP COLUMN "collectionId",
ADD COLUMN     "roundId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Contribution" DROP COLUMN "collectionId",
DROP COLUMN "collectionMemberId",
ADD COLUMN     "roundId" TEXT NOT NULL,
ADD COLUMN     "roundMemberId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Field" DROP COLUMN "collectionId",
ADD COLUMN     "roundId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Guideline" DROP COLUMN "collectionId",
ADD COLUMN     "roundId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "collectionId",
ADD COLUMN     "roundId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "collectionId",
DROP COLUMN "collectionMemberId",
ADD COLUMN     "roundId" TEXT,
ADD COLUMN     "roundMemberId" TEXT;

-- DropTable
DROP TABLE "Collection";

-- DropTable
DROP TABLE "CollectionMember";

-- DropTable
DROP TABLE "_BucketToCollectionMember";

-- CreateTable
CREATE TABLE "RoundMember" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isModerator" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "hasJoined" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "incomingAccountId" TEXT,
    "outgoingAccountId" TEXT,
    "statusAccountId" TEXT,

    CONSTRAINT "RoundMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "singleRound" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "info" TEXT,
    "about" TEXT,
    "color" TEXT,
    "registrationPolicy" "RegistrationPolicy" NOT NULL,
    "currency" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT E'PUBLIC',
    "maxAmountToBucketPerUser" INTEGER,
    "bucketCreationCloses" TIMESTAMP(3),
    "grantingOpens" TIMESTAMP(3),
    "grantingCloses" TIMESTAMP(3),
    "allowStretchGoals" BOOLEAN,
    "requireBucketApproval" BOOLEAN,
    "bucketReviewIsOpen" BOOLEAN,
    "discourseCategoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BucketToRoundMember" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RoundMember_incomingAccountId_key" ON "RoundMember"("incomingAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundMember_outgoingAccountId_key" ON "RoundMember"("outgoingAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundMember_statusAccountId_key" ON "RoundMember"("statusAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundMember_userId_roundId_key" ON "RoundMember"("userId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_organizationId_slug_key" ON "Round"("organizationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "_BucketToRoundMember_AB_unique" ON "_BucketToRoundMember"("A", "B");

-- CreateIndex
CREATE INDEX "_BucketToRoundMember_B_index" ON "_BucketToRoundMember"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_roundId_value_key" ON "Tag"("roundId", "value");

-- AddForeignKey
ALTER TABLE "RoundMember" ADD CONSTRAINT "RoundMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundMember" ADD CONSTRAINT "RoundMember_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundMember" ADD CONSTRAINT "RoundMember_incomingAccountId_fkey" FOREIGN KEY ("incomingAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundMember" ADD CONSTRAINT "RoundMember_statusAccountId_fkey" FOREIGN KEY ("statusAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundMember" ADD CONSTRAINT "RoundMember_outgoingAccountId_fkey" FOREIGN KEY ("outgoingAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guideline" ADD CONSTRAINT "Guideline_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bucket" ADD CONSTRAINT "Bucket_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_collMemberId_fkey" FOREIGN KEY ("collMemberId") REFERENCES "RoundMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_collMemberId_fkey" FOREIGN KEY ("collMemberId") REFERENCES "RoundMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_roundMemberId_fkey" FOREIGN KEY ("roundMemberId") REFERENCES "RoundMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_allocatedById_fkey" FOREIGN KEY ("allocatedById") REFERENCES "RoundMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_roundMemberId_fkey" FOREIGN KEY ("roundMemberId") REFERENCES "RoundMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_roundMemberId_fkey" FOREIGN KEY ("roundMemberId") REFERENCES "RoundMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BucketToRoundMember" ADD FOREIGN KEY ("A") REFERENCES "Bucket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BucketToRoundMember" ADD FOREIGN KEY ("B") REFERENCES "RoundMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
