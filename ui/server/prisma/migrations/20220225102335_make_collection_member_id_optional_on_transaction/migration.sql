-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_collectionMemberId_fkey";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "collectionMemberId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_collectionMemberId_fkey" FOREIGN KEY ("collectionMemberId") REFERENCES "CollectionMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
