import { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  avatar: String,
  bio: String,
  email: {
    type: String,
    required: true,
    unique: true,
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
});

export default UserSchema;