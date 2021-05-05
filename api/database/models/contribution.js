const { Schema } = require("mongoose");

const ContributionSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventMemberId: { type: Schema.Types.ObjectId, required: true },
  dreamId: { type: Schema.Types.ObjectId, required: true, index: true },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
  },
  createdAt: { type: Date, required: true, default: Date.now },
});

module.exports = ContributionSchema;
