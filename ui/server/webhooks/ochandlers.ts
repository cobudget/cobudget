import { OC_STATUS_MAP } from "../../constants";
import { getExpense } from "server/graphql/resolvers/helpers";
import prisma from "server/prisma";
import { getOCToken } from "server/utils/roundUtils";

// helper
export const ocExpenseToCobudget = (expense, roundId, isEditing) => {
  return [
    {
      // If editing expense, then dont include bucketId
      ...(!isEditing && { bucketId: expense.customData?.b }),
      title: expense.description,
      status: OC_STATUS_MAP[expense.status],
      submittedBy: expense.customData?.u,
      currency: expense.amountV2?.currency,

      recipientName: expense.payoutMethod?.data?.accountHolderName,
      recipientEmail: expense.payoutMethod?.data?.details?.email,

      ocId: expense.id,
      roundId,
    },
    isEditing,
    expense.items,
  ];
};

// helper
export const ocItemToCobudgetReceipt = (item, expense) => {
  return {
    description: item.description,
    amount: item.amount,
    date: item.createdAt,
    attachment: item.file?.url,
    expenseId: expense.id,
    ocExpenseReceiptId: item.id,
  };
};

export const handleExpenseChange = async (req, res) => {
  try {
    const round = await prisma.round.findFirst({ where: { id: req.round } });
    const expenseId = req.body.data?.expense?.id;
    let dbExpense; //expense in cobudget database
    if (expenseId) {
      const expense = await getExpense(expenseId, getOCToken(round));
      const expenseData = {
        bucketId: expense.customData?.b,
        title: expense.description,
        status: OC_STATUS_MAP[expense.status],
        submittedBy: expense.customData?.u,
        currency: expense.amountV2?.currency,

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
          attachment: item.file?.url,
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
    res.send({ status: "fail" });
  }
};
