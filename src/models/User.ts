// User model for MongoDB
// TODO: Implement User schema with email, password, name, role
import mongoose, { Schema, Document } from 'mongoose';
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
  location?: string;
  role: 'admin' | 'manager' | 'agent';
  avatar?: Buffer;
  avatarType?: string;
  lastLogin?: Date;
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
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'agent'],
      default: 'agent',
    },
    avatar: {
      type: Buffer,
    },
    avatarType: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
