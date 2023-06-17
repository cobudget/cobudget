-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExpenseStatus" ADD VALUE 'DRAFT';
ALTER TYPE "ExpenseStatus" ADD VALUE 'UNVERIFIED';
ALTER TYPE "ExpenseStatus" ADD VALUE 'PENDING';
ALTER TYPE "ExpenseStatus" ADD VALUE 'INCOMPLETE';
ALTER TYPE "ExpenseStatus" ADD VALUE 'APPROVED';
ALTER TYPE "ExpenseStatus" ADD VALUE 'PROCESSING';
ALTER TYPE "ExpenseStatus" ADD VALUE 'ERROR';
ALTER TYPE "ExpenseStatus" ADD VALUE 'SCHEDULED_FOR_PAYMENT';
ALTER TYPE "ExpenseStatus" ADD VALUE 'SPAM';
ALTER TYPE "ExpenseStatus" ADD VALUE 'CANCELED';
