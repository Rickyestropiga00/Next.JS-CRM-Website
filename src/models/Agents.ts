import mongoose, { Document, Schema } from 'mongoose';
export type roleType = 'Admin' | 'Agent' | 'Manager';
export type statusType = 'Active' | 'Inactive' | 'On Leave';
export interface IAgents extends Document {
  agentId: string;
  name: string;
  userId: mongoose.Schema.Types.ObjectId;
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
      default: () => new Date(Date.now() + 4 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

agentsSchema.pre('findOneAndDelete', async function () {
  const doc = await this.model.findOne(this.getFilter());

  if (!doc) return;

  const user = await mongoose.model('User').findById(doc.userId);

  if (user?.role === 'Admin') return;

  await mongoose.model('User').findByIdAndDelete(doc.userId);
});

const Agents =
  mongoose.models.Agents || mongoose.model<IAgents>('Agents', agentsSchema);

export default Agents;
