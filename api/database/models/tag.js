const { Schema } = require("mongoose");

const TagSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  eventId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, required: true, default: Date.now },
  value: { type: String, required: true },
}).index({ eventId: 1, value: 1 }, { unique: true });

module.exports = TagSchema;
