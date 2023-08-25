/*
  Warnings:

  - A unique constraint covering the columns `[ocExpenseReceiptId]` on the table `ExpenseReceipt` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExpenseReceipt_ocExpenseReceiptId_key" ON "ExpenseReceipt"("ocExpenseReceiptId");
