const { Schema } = require("mongoose");

const EventMemberSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
  },
  orgMemberId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
    ref: "OrgMember",
  },
  isAdmin: { type: Boolean, required: true, default: false },
  isGuide: { type: Boolean, default: false },
  //roles: [{ type: String, enum: ['ADMIN', 'GUIDE'] }],
  isApproved: { type: Boolean, required: true, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}).index({ orgMemberId: 1, eventId: 1 }, { unique: true });

module.exports = EventMemberSchema;
