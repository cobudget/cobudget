import { verify } from "server/utils/jwt";
import { handleExpenseChange } from "server/webhooks/ochandlers";

function handleOCExpense(req, res) {
  const payload = verify(req.query["webhook-token"]);
  if (payload.rid) {
    req.roundId = payload.rid;
    return handleExpenseChange(req, res);
  } else {
    res.send({ status: "error" });
  }
}

export default handleOCExpense;
