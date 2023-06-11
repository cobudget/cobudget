/*
  Warnings:

  - You are about to drop the column `currency` on the `ExpenseReceipt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "currency" TEXT;

-- AlterTable
ALTER TABLE "ExpenseReceipt" DROP COLUMN "currency";
