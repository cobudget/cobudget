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
  customDomain: {
    type: String,
    unique: true,
    sparse: true,
  },
  logo: new Schema({ small: String, large: String }),
}).index({ name: 'text', subdomain: 'text', customDomain: 'text' });

export default OrganizationSchema;
