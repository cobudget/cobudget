-- CreateTable
CREATE TABLE "ExpenseReceipt" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "attachment" TEXT,
    "expenseId" TEXT,

    CONSTRAINT "ExpenseReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "bucketId" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "swiftCode" TEXT DEFAULT E'',
    "iban" TEXT DEFAULT E'',
    "country" TEXT NOT NULL DEFAULT E'',
    "city" TEXT NOT NULL DEFAULT E'',
    "recipientAddress" TEXT NOT NULL,
    "recipientPostalCode" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExpenseReceipt" ADD CONSTRAINT "ExpenseReceipt_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_bucketId_fkey" FOREIGN KEY ("bucketId") REFERENCES "Bucket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
