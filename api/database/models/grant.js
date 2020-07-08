import { Schema } from 'mongoose';

const GrantSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, required: true, index: true },
  dreamId: { type: Schema.Types.ObjectId, required: true, index: true },
  memberId: { type: Schema.Types.ObjectId, required: true },
  value: { type: Number, required: true },
  reclaimed: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ['PRE_FUND', 'USER', 'POST_FUND'],
    default: 'USER',
    required: true,
  },
});

export default GrantSchema;