/*
  Warnings:

  - A unique constraint covering the columns `[statusAccountId]` on the table `Bucket` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[incomingAccountId]` on the table `CollectionMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[outgoingAccountId]` on the table `CollectionMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[statusAccountId]` on the table `CollectionMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ALLOCATION', 'CONTRIBUTION');

-- AlterTable
ALTER TABLE "Bucket" ADD COLUMN     "statusAccountId" TEXT;

-- AlterTable
ALTER TABLE "CollectionMember" ADD COLUMN     "incomingAccountId" TEXT,
ADD COLUMN     "outgoingAccountId" TEXT,
ADD COLUMN     "statusAccountId" TEXT;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectionMemberId" TEXT NOT NULL,
    "fromAccountId" TEXT NOT NULL,
    "toAccountId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bucket_statusAccountId_key" ON "Bucket"("statusAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionMember_incomingAccountId_key" ON "CollectionMember"("incomingAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionMember_outgoingAccountId_key" ON "CollectionMember"("outgoingAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectionMember_statusAccountId_key" ON "CollectionMember"("statusAccountId");

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_incomingAccountId_fkey" FOREIGN KEY ("incomingAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_outgoingAccountId_fkey" FOREIGN KEY ("outgoingAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionMember" ADD CONSTRAINT "CollectionMember_statusAccountId_fkey" FOREIGN KEY ("statusAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bucket" ADD CONSTRAINT "Bucket_statusAccountId_fkey" FOREIGN KEY ("statusAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_collectionMemberId_fkey" FOREIGN KEY ("collectionMemberId") REFERENCES "CollectionMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
