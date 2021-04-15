const { Schema } = require("mongoose");
const calculateGoals = require("../../utils/calculateGoals");

const DreamSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, index: true, required: true },
  title: { type: String, required: true },
  summary: {
    type: String,
    maxlength: 160,
  },
  description: String,
  cocreators: [Schema.Types.ObjectId],
  customFields: [
    new Schema({
      fieldId: { type: Schema.Types.ObjectId, required: true },
      eventId: { type: Schema.Types.ObjectId, required: true },
      value: Schema.Types.Mixed,
    }),
  ],
  images: [new Schema({ small: String, large: String })],
  comments: [
    new Schema({
      authorId: Schema.Types.ObjectId,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      content: String,
      isLog: Boolean,
    }),
  ],
  approved: { type: Boolean, default: false },
  flags: [
    new Schema({
      guidelineId: Schema.Types.ObjectId,
      userId: Schema.Types.ObjectId,
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      type: {
        type: String,
        enum: ["RAISE_FLAG", "RESOLVE_FLAG", "ALL_GOOD_FLAG"],
        required: true,
      },
      resolvingFlagId: Schema.Types.ObjectId,
    }),
  ],
  budgetItems: [
    new Schema({
      description: { type: String, required: true },
      min: { type: Number, required: true },
      max: Number,
      type: {
        type: String,
        enum: ["INCOME", "EXPENSE"],
        required: true,
      },
    }),
  ],
  published: { type: Boolean, default: false },
  fundedAt: { type: Date },
  completedAt: { type: Date },
  discourseTopicId: { type: Number },
}).index({ title: "text", description: "text", summary: "text" });

DreamSchema.virtual("minGoal").get(function () {
  const { min } = calculateGoals(this.budgetItems);
  return min;
});

DreamSchema.virtual("maxGoal").get(function () {
  const { max } = calculateGoals(this.budgetItems);
  return max;
});

DreamSchema.virtual("funded").get(function () {
  return !!this.fundedAt;
});

DreamSchema.virtual("completed").get(function () {
  return !!this.completedAt;
});

module.exports = DreamSchema;
