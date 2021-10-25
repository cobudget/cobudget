/*
  Warnings:

  - Made the column `bucketId` on table `Flag` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Flag" DROP CONSTRAINT "Flag_bucketId_fkey";

-- AlterTable
ALTER TABLE "Flag" ALTER COLUMN "bucketId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_bucketId_fkey" FOREIGN KEY ("bucketId") REFERENCES "Bucket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
