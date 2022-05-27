-- AlterTable
ALTER TABLE "Allocation" ADD COLUMN     "stripeSessionId" TEXT;

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "stripeSessionId" TEXT;
