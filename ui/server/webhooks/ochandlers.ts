import { OC_STATUS_MAP } from "../../constants";
import { getExpense } from "server/graphql/resolvers/helpers";
import prisma from "server/prisma";

export const handleExpenseChange = async (req, res) => {
  try {
    const expenseId = req.body.data?.expense?.id;
    if (expenseId) {
      const expense = await getExpense(expenseId);
      console.log("Expense", expense.items);
      const expenseData = {
        bucketId: expense.customData.b,
        title: expense.description,
        status: OC_STATUS_MAP[expense.status],
        submittedBy: expense.customData.u,

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
      };

      const existingExpense = await prisma.expense.findFirst({
        where: { ocId: expense.id },
      });
      if (existingExpense) {
        const updated = await prisma.expense.update({
          where: { id: existingExpense.id },
          data: expenseData,
        });
      } else {
        const added = await prisma.expense.create({ data: expenseData });
        console.log("Added", added);
      }
    } else {
      throw new Error("Expense id missing");
    }
  } catch (err) {
    console.log("ERROR", err);
    res.send({ status: "fail" });
  }
};
