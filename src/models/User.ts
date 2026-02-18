// User model for MongoDB
// TODO: Implement User schema with email, password, name, role
import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'agent';
  createdAt: Date;
  updatedAt: Date;
}
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'agent'],
      default: 'agent',
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
