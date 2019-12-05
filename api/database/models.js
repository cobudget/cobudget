import { Schema } from 'mongoose';

// User
const UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Membership
const MembershipSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    index: true,
    required: true
  },
  isAdmin: { type: Boolean, required: true, default: false }
  // guide
  // joined?
  // ticket?
}).index({ userId: 1, eventId: 1 }, { unique: true });

// Event
const EventSchema = new Schema({
  slug: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  title: { type: String, required: true },
  description: String
});

// Dream
const DreamSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, required: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  teamIds: [Schema.Types.ObjectId],
  budgetDescription: String,
  minFunding: Number
}).index({ eventId: 1, slug: 1 }, { unique: true });

export const getModels = db => {
  return {
    User: db.model('User', UserSchema),
    Membership: db.model('Membership', MembershipSchema),
    Event: db.model('Event', EventSchema),
    Dream: db.model('Dream', DreamSchema)
  };
};
