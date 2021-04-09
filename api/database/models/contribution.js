const { Schema } = require("mongoose");

const ContributionSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventMemberId: { type: Schema.Types.ObjectId, required: true },
  dreamId: { type: Schema.Types.ObjectId, required: true, index: true },
  amount: { type: Number, required: true },
});

module.exports = ContributionSchema;
