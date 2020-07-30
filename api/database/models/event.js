import { Schema } from 'mongoose';
const dayjs = require('dayjs');

const EventSchema = new Schema({
  slug: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  title: { type: String, required: true },
  info: String,
  currency: String,
  registrationPolicy: {
    type: String,
    enum: ['OPEN', 'REQUEST_TO_JOIN', 'INVITE_ONLY'],
    default: 'OPEN',
    required: true,
  },
  totalBudget: Number,
  grantValue: Number,
  grantsPerMember: {
    type: Number,
    default: 10,
  },
  maxGrantsToDream: Number,
  dreamCreationCloses: Date,
  grantingOpens: Date,
  grantingCloses: Date,
  pretixEvent: String,
  guidelines: String,
  allowStretchGoals: { type: Boolean, default: false },
  color: { type: String, default: 'anthracit' },
  about: { type: String },
  customFields: [
    new Schema({
      name: { type: String, required: true },
      description: { type: String, required: true },
      type: {
        type: String,
        enum: ['TEXT', 'MULTILINE_TEXT','BOOLEAN','ENUM','FILE'],
        default: 'TEXT',
        required: true,
      },
      isRequired: { type: Boolean, required: true },
      position: {
        type: Number,
        required: true,
        default: 1000
      },
      isShownOnFrontPage: Boolean,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }).index({ position: 1 }),
  ],
})

EventSchema.virtual('grantingIsOpen').get(function () {
  if (!this.grantingOpens) return false;

  const now = dayjs();
  const grantingOpens = dayjs(this.grantingOpens);

  if (this.grantingCloses) {
    const grantingCloses = dayjs(this.grantingCloses);
    return grantingOpens.isBefore(now) && now.isBefore(grantingCloses);
  } else {
    return grantingOpens.isBefore(now);
  }
});

EventSchema.virtual('grantingHasClosed').get(function () {
  if (!this.grantingCloses) return false;

  return dayjs().isBefore(dayjs(this.grantingCloses));
});

EventSchema.virtual('dreamCreationIsOpen').get(function () {
  if (!this.dreamCreationCloses) return true;

  const now = dayjs();
  const dreamCreationCloses = dayjs(this.dreamCreationCloses);

  return now.isBefore(dreamCreationCloses);
});

export default EventSchema;