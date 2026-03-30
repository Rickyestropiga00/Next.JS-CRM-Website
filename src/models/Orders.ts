import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'Pending' | 'In Transit' | 'Completed' | 'Canceled';
export type PaymentStatus = 'Paid' | 'Unpaid';

export interface IOrder extends Document {
  orderId: string;
  customer: mongoose.Types.ObjectId;
  address: string;
  product: mongoose.Types.ObjectId;
  productType: string;
  item: string;
  quantity: number;
  total: number;
  payment: PaymentStatus;
  status: OrderStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer name is required'],
    },
    address: {
      type: String,
      required: [true, 'Customer address is required'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },

    productType: {
      type: String,
      required: [true, 'Product type is required'],
    },
    item: {
      type: String,
      required: [true, 'Item name is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    total: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    payment: {
      type: String,
      enum: ['Paid', 'Unpaid'],
      required: [true, 'Payment status is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Transit', 'Completed', 'Canceled'],
      required: [true, 'Order status is required'],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const Order =
  mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
