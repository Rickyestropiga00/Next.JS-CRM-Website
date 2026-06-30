import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentComments extends Document {
  agentId: mongoose.Schema.Types.ObjectId;
  content: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

const agentCommentSchema = new Schema<IAgentComments>(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agents',
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

const AgentComments =
  mongoose.models.AgentComments ||
  mongoose.model<IAgentComments>('AgentComments', agentCommentSchema);

export default AgentComments;
