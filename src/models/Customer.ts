import mongoose, { Document, Schema } from 'mongoose';

export type CustomerStatus = 'Lead' | 'Active' | 'Inactive' | 'Prospect';

export interface ICustomer extends Document {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: CustomerStatus;
  lastContacted?: string;
  expiresAt: Date;
  notes?: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email must be unique'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: [true, 'Phone must be unique'],
    },
    company: {
      type: String,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Lead', 'Active', 'Inactive', 'Prospect'],
    },
    lastContacted: {
      type: String,
    },
    notes: {
      type: String,
    },
    comment: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 4 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const Customer =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;
