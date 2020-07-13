import { Schema } from 'mongoose';

const MemberSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true,
    ref: 'User',
  },
  isAdmin: { type: Boolean, required: true, default: false },
  isGuide: { type: Boolean, default: false },
  //roles: [{ type: String, enum: ['ADMIN', 'GUIDE'] }],
  isApproved: { type: Boolean, required: true, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Dream' }],
}).index({ userId: 1, eventId: 1 }, { unique: true });

export default MemberSchema;