import mongoose, { Document, Schema } from 'mongoose';
export type roleType = 'Admin' | 'Agent' | 'Manager';
export type statusType = 'Active' | 'Inactive' | 'On Leave';
export interface IAgents extends Document {
  agentId: string;
  name: string;
  email: string;
  phone: string;
  role: roleType;
  status: statusType;
  assignedCustomers?: string[];
  expiresAt: Date;
  notes?: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const agentsSchema = new Schema<IAgents>(
  {
    agentId: {
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
    role: {
      type: String,
      required: [true, 'Role is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
    },
    assignedCustomers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
      },
    ],
    notes: {
      type: String,
    },
    comment: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const Agents =
  mongoose.models.Agents || mongoose.model<IAgents>('Agents', agentsSchema);

export default Agents;
