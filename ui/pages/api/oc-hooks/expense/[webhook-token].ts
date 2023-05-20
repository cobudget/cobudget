function handleOCExpense (req, res) {
    console.log(req.query["webhook-token"]);

    console.log("Body");
    console.log(req.body);

    res.send({ status: "success" });
}

export default handleOCExpense;
