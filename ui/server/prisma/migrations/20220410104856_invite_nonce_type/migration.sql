/*
  Warnings:

  - The `inviteNonce` column on the `Collection` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "inviteNonce",
ADD COLUMN     "inviteNonce" INTEGER;
