/*
  Warnings:

  - You are about to drop the column `countributionsCount` on the `Bucket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bucket" DROP COLUMN "countributionsCount",
ADD COLUMN     "contributionsCount" INTEGER;
