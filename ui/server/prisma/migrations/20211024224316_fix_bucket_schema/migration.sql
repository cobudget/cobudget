/*
  Warnings:

  - You are about to drop the column `userId` on the `Flag` table. All the data in the column will be lost.
  - Added the required column `orgMemberId` to the `Flag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Flag" DROP CONSTRAINT "Flag_userId_fkey";

-- AlterTable
ALTER TABLE "Flag" DROP COLUMN "userId",
ADD COLUMN     "orgMemberId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_orgMemberId_fkey" FOREIGN KEY ("orgMemberId") REFERENCES "OrgMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "DiscourseConfig_organizationId_unique" RENAME TO "DiscourseConfig_organizationId_key";

-- RenameIndex
ALTER INDEX "Flag_resolvingFlagId_unique" RENAME TO "Flag_resolvingFlagId_key";
