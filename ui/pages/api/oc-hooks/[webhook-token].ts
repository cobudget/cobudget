import { verify } from "server/utils/jwt";

function handleOCExpense(req, res) {
  const payload = verify(req.query["webhook-token"]);

  if (payload.rid) {
    res.send({ status: "success" });
  } else {
    res.send({ status: "error" });
  }
}

export default handleOCExpense;
