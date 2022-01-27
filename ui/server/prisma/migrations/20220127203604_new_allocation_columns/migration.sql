/*
  Warnings:

  - Added the required column `allocatedById` to the `Allocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `allocationType` to the `Allocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountBefore` to the `Allocation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AllocationType" AS ENUM ('ADD', 'SET');

-- AlterTable
ALTER TABLE "Allocation" ADD COLUMN     "allocatedById" TEXT NOT NULL,
ADD COLUMN     "allocationType" "AllocationType" NOT NULL,
ADD COLUMN     "amountBefore" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_allocatedById_fkey" FOREIGN KEY ("allocatedById") REFERENCES "CollectionMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
