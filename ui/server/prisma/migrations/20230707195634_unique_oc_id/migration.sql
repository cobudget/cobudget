/*
  Warnings:

  - A unique constraint covering the columns `[ocId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Expense_ocId_key" ON "Expense"("ocId");
