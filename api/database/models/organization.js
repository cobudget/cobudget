import { Schema } from 'mongoose';

const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
  },
}).index({ name: 'text', subdomain: 'text' });

export default OrganizationSchema;