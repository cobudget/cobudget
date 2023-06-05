import { OC_STATUS_MAP } from "../../constants";
import { getExpense } from "server/graphql/resolvers/helpers";
import prisma from "server/prisma";

export const handleExpenseChange = async (req, res) => {
  try {
    const expenseId = req.body.data?.expense?.id;
    let dbExpense; //expense in cobudget database
    if (expenseId) {
      const expense = await getExpense(expenseId);
      const expenseData = {
        bucketId: expense.customData?.b,
        title: expense.description,
        status: OC_STATUS_MAP[expense.status],
        submittedBy: expense.customData?.u,

        recipientName: expense.payoutMethod?.data?.accountHolderName,
        recipientEmail: expense.payoutMethod?.data?.details?.email,
        swiftCode: "",
        iban: "",
        country: expense.payoutMethod?.data?.details?.address?.country,
        city: expense.payoutMethod?.data?.details?.address?.city,
        recipientAddress:
          expense.payoutMethod?.data?.details?.address?.firstLine,
        recipientPostalCode:
          expense.payoutMethod?.data?.details?.address?.recipientPostCode,

        ocId: expense.id,
        roundId: req.roundId,
      };

      const existingExpense = await prisma.expense.findFirst({
        where: { ocId: expense.id },
      });
      if (existingExpense) {
        delete expenseData.bucketId;
        dbExpense = await prisma.expense.update({
          where: { id: existingExpense.id },
          data: expenseData,
        });
      } else {
        dbExpense = await prisma.expense.create({ data: expenseData });
      }

      const items = expense.items.map(async (item) => {
        const existing = await prisma.expenseReceipt.findFirst({
          where: { ocExpenseReceiptId: item.id },
        });

        const receiptData = {
          description: item.description,
          amount: item.amount,
          date: item.createdAt,
          attachment: item.file.url,
          expenseId: dbExpense.id as string,
          ocExpenseReceiptId: item.id,
        };
        if (existing) {
          return prisma.expenseReceipt.update({
            where: { id: existing.id },
            data: receiptData,
          });
        } else {
          return prisma.expenseReceipt.create({
            data: receiptData,
          });
        }
      });
    } else {
      throw new Error("Expense id missing");
    }
  } catch (err) {
    console.log("ERROR", err);
    res.send({ status: "fail" });
  }
};
