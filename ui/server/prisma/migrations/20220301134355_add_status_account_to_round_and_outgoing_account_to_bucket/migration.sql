/*
  Warnings:

  - A unique constraint covering the columns `[outgoingAccountId]` on the table `Bucket` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[statusAccountId]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Bucket" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "outgoingAccountId" TEXT;

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "statusAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Bucket_outgoingAccountId_key" ON "Bucket"("outgoingAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_statusAccountId_key" ON "Collection"("statusAccountId");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_statusAccountId_fkey" FOREIGN KEY ("statusAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bucket" ADD CONSTRAINT "Bucket_outgoingAccountId_fkey" FOREIGN KEY ("outgoingAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
