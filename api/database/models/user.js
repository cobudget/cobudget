const { Schema } = require('mongoose');

const UserSchema = new Schema({
  name: String,
  avatar: String,
  bio: String,
  email: {
    type: String,
    required: true,
  },
  verifiedEmail: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  organizationId: { type: Schema.Types.ObjectId, index: true, required: true },
  isOrgAdmin: {
    type: Boolean,
    default: false,
  },
  isRootAdmin: {
    type: Boolean,
    default: false,
  },
}).index({ email: 1, organizationId: 1 }, { unique: true }); // Unique on email + organization Id

module.exports = UserSchema;
