-- CreateEnum
CREATE TYPE "AllocationType" AS ENUM ('ADD', 'SET');

-- AlterTable
ALTER TABLE "Allocation" ADD COLUMN     "allocatedById" TEXT,
ADD COLUMN     "allocationType" "AllocationType" NOT NULL DEFAULT E'ADD',
ADD COLUMN     "amountBefore" INTEGER;

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "amountBefore" INTEGER;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_allocatedById_fkey" FOREIGN KEY ("allocatedById") REFERENCES "CollectionMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
