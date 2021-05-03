const { Schema } = require("mongoose");
const dayjs = require("dayjs");

const EventSchema = new Schema({
  slug: {
    type: String,
    required: true,
  },
  title: { type: String, required: true },
  info: String,
  currency: String,
  registrationPolicy: {
    type: String,
    enum: ["OPEN", "REQUEST_TO_JOIN", "INVITE_ONLY"],
    default: "OPEN",
    required: true,
  },
  archived: { type: Boolean, default: false },
  maxAmountToDreamPerUser: Number,
  dreamCreationCloses: Date,
  grantingOpens: Date,
  grantingCloses: Date,
  pretixEvent: String,
  guidelines: [
    new Schema({
      title: { type: String, required: true },
      description: { type: String, required: true },
      position: {
        type: Number,
        required: true,
      },
    }),
  ],
  allowStretchGoals: { type: Boolean, default: false },
  color: { type: String, default: "anthracit" },
  about: { type: String },
  organizationId: { type: Schema.Types.ObjectId, required: true },
  customFields: [
    new Schema({
      name: { type: String, required: true },
      description: { type: String, required: true },
      type: {
        type: String,
        enum: ["TEXT", "MULTILINE_TEXT", "BOOLEAN", "ENUM", "FILE"],
        default: "TEXT",
        required: true,
      },
      isRequired: { type: Boolean, required: true },
      position: {
        type: Number,
        required: true,
      },
      isShownOnFrontPage: Boolean,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }).index({ position: 1 }),
  ],
  dreamReviewIsOpen: Boolean,
  discourseCategoryId: { type: Number },
}).index({ slug: 1, organizationId: 1 }, { unique: true }); // Unique on slug + organization Id

EventSchema.virtual("grantingIsOpen").get(function () {
  const now = dayjs();
  const grantingHasOpened = this.grantingOpens
    ? dayjs(this.grantingOpens).isBefore(now)
    : true;
  const grantingHasClosed = this.grantingCloses
    ? dayjs(this.grantingCloses).isBefore(now)
    : false;

  return grantingHasOpened && !grantingHasClosed;
});

EventSchema.virtual("grantingHasClosed").get(function () {
  return this.grantingCloses
    ? dayjs(this.grantingCloses).isBefore(dayjs())
    : false;
});

EventSchema.virtual("dreamCreationIsOpen").get(function () {
  if (!this.dreamCreationCloses) return true;

  const now = dayjs();
  const dreamCreationCloses = dayjs(this.dreamCreationCloses);

  return now.isBefore(dreamCreationCloses);
});

module.exports = EventSchema;
