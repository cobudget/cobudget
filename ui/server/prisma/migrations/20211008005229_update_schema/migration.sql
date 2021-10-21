-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_collectionMemberId_fkey";

-- DropForeignKey
ALTER TABLE "Flag" DROP CONSTRAINT "Flag_guidelineId_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "collectionMemberId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Flag" ALTER COLUMN "guidelineId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_collectionMemberId_fkey" FOREIGN KEY ("collectionMemberId") REFERENCES "CollectionMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_guidelineId_fkey" FOREIGN KEY ("guidelineId") REFERENCES "Guideline"("id") ON DELETE SET NULL ON UPDATE CASCADE;
