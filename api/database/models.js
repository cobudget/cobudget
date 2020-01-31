const { Schema } = require('mongoose');

// // User
// const UserSchema = new Schema({
//   name: String,
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   verified: {
//     type: Boolean,
//     default: false
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// Member
const MemberSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true
  },
  email: {
    type: String,
    index: true,
    required: true
  },
  verifiedEmail: {
    type: Boolean,
    default: false
  },
  name: String,
  avatar: String,
  isAdmin: { type: Boolean, required: true, default: false },
  isApproved: { type: Boolean, required: true, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
  // guide
  // joined?
  // ticket?
}).index({ email: 1, eventId: 1 }, { unique: true });

// Event
const EventSchema = new Schema({
  slug: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  title: { type: String, required: true },
  description: String,
  currency: String,
  registrationPolicy: {
    type: String,
    enum: ['OPEN', 'REQUEST_TO_JOIN', 'INVITE_ONLY'],
    default: 'OPEN',
    required: true
  },
  totalBudget: Number,
  grantValue: Number,
  grantsPerMember: {
    type: Number,
    default: 10
  },
  grantingOpened: Date,
  grantingClosed: Date
});

EventSchema.virtual('grantingOpen').get(function() {
  if (this.grantingOpened && !this.grantingClosed) return true;
  return false;
});

// Dream
const DreamSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, required: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  members: [Schema.Types.ObjectId],
  budgetDescription: String,
  minGoal: Number,
  maxGoal: Number,
  images: [new Schema({ small: String, large: String })]
}).index({ eventId: 1, slug: 1 }, { unique: true });

const GrantSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, required: true, index: true },
  dreamId: { type: Schema.Types.ObjectId, required: true, index: true },
  memberId: { type: Schema.Types.ObjectId, required: true },
  value: { type: Number, required: true }
});

const getModels = db => {
  return {
    Member: db.model('Member', MemberSchema),
    Event: db.model('Event', EventSchema),
    Dream: db.model('Dream', DreamSchema),
    Grant: db.model('Grant', GrantSchema)
  };
};

module.exports = { getModels };
