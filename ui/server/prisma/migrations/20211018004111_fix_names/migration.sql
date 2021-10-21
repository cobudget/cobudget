/*
  Warnings:

  - You are about to drop the column `maxAmountToDreamPerUser` on the `Collection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "maxAmountToDreamPerUser",
ADD COLUMN     "maxAmountToBucketPerUser" INTEGER;
