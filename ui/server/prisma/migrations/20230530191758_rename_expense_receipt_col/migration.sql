/*
  Warnings:

  - You are about to drop the column `ocExpenseId` on the `ExpenseReceipt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ExpenseReceipt" DROP COLUMN "ocExpenseId",
ADD COLUMN     "ocExpenseReceiptId" TEXT;
