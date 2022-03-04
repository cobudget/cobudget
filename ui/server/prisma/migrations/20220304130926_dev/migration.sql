/*
  Warnings:

  - You are about to drop the column `organizationId` on the `DiscourseConfig` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `OrgMember` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Round` table. All the data in the column will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[groupId]` on the table `DiscourseConfig` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,userId]` on the table `OrgMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,slug]` on the table `Round` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `DiscourseConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `OrgMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupId` to the `Round` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DiscourseConfig" DROP CONSTRAINT "DiscourseConfig_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrgMember" DROP CONSTRAINT "OrgMember_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Round" DROP CONSTRAINT "Round_organizationId_fkey";

-- DropIndex
DROP INDEX "DiscourseConfig_organizationId_key";

-- DropIndex
DROP INDEX "OrgMember_organizationId_userId_key";

-- DropIndex
DROP INDEX "Round_organizationId_slug_key";

-- AlterTable
ALTER TABLE "DiscourseConfig" DROP COLUMN "organizationId",
ADD COLUMN     "groupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrgMember" DROP COLUMN "organizationId",
ADD COLUMN     "groupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Round" DROP COLUMN "organizationId",
ADD COLUMN     "groupId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Organization";

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "info" TEXT,
    "logo" TEXT,
    "customDomain" TEXT,
    "finishedTodos" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_slug_key" ON "Group"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "DiscourseConfig_groupId_key" ON "DiscourseConfig"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgMember_groupId_userId_key" ON "OrgMember"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Round_groupId_slug_key" ON "Round"("groupId", "slug");

-- AddForeignKey
ALTER TABLE "OrgMember" ADD CONSTRAINT "OrgMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscourseConfig" ADD CONSTRAINT "DiscourseConfig_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
