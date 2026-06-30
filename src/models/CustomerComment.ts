import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerComment extends Document {
  customerId: mongoose.Schema.Types.ObjectId;
  content: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerCommentSchema = new Schema<ICustomerComment>(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
    },
  },
  { timestamps: true }
);

const CustomerComment =
  mongoose.models.CustomerComment ||
  mongoose.model<ICustomerComment>('CustomerComment', customerCommentSchema);

export default CustomerComment;
