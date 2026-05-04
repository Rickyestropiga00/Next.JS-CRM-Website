import mongoose, { Schema, Document } from 'mongoose';

export type ProductTypes = 'Physical' | 'Digital' | 'Service' | 'Subscription';
export type ProductStatus = 'Active' | 'Disabled';

export interface IProduct extends Document {
  productId: string;
  name: string;
  code: string;
  productType: ProductTypes;
  stock: number;
  price: number;
  status: ProductStatus;
  image?: Buffer;
  imageType?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    productId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
    },
    code: {
      type: String,
      required: [true, 'Product code is required'],
      unique: [true, 'Product code must be unique'],
    },
    productType: {
      type: String,
      required: [true, 'Product type is required'],
      enum: ['Physical', 'Digital', 'Service', 'Subscription'],
      default: 'Physical',
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Product status is required'],
      enum: ['Active', 'Disabled'],
      default: 'Active',
    },
    image: {
      type: Buffer,
    },
    imageType: {
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
const Product =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;
