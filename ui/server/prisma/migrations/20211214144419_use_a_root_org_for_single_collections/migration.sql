/*
  Warnings:

  - Made the column `organizationId` on table `Collection` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_organizationId_fkey";

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "singleCollection" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
