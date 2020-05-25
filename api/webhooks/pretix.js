module.exports = (req, res) => {
  // example request body:
  //   {
  //     "notification_id": 123455,
  //     "organizer": "acmecorp",
  //     "event": "democon",
  //     "code": "ABC23",
  //     "action": "pretix.event.order.placed"
  //   }
  // pretix.event.order.paid
  // todo:
  // verify that it is real, call pretix API and use process.env.PRETIX_TOKEN as authorization
  // check if user exists, if not create it.
  // check if membership exists, if not create it.
};
