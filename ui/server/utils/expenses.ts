import crypto from "crypto";

export const getExpenseHash = (expense) => {
  const keys = ["title", "status", "currency", "ocId", "roundId"];
  let values = "";
  keys.forEach((k) => {
    values += `${expense[k]},`;
  });
  const hash = crypto.createHash("md5").update(values).digest("hex");
  return hash;
};

export const getExpenseUpdateRawQuery = (expenses) => {
  const query = `
        UPDATE "Expense" SET 
            title = CASE
                ${expenses
                  .map((e) => {
                    return `WHEN id='${e.id}' THEN '${e.title.replace(
                      /'/g,
                      "''"
                    )}'`;
                  })
                  .join("\n")}
            END,
            status = CASE
                ${expenses
                  .map((e) => {
                    return `WHEN id='${e.id}' THEN '${e.status}'::"ExpenseStatus"`;
                  })
                  .join("\n")}
            END,
            currency = CASE
                ${expenses
                  .map((e) => {
                    return `WHEN id='${e.id}' THEN '${e.currency}'`;
                  })
                  .join("\n")}
            END
        WHERE id IN (${expenses.map((e) => `'${e.id}'`).join(",")});
    `;
  return query;
};
