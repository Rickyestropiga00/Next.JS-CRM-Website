import mongoose, { Schema, Document } from 'mongoose';

export type ColumnKey = 'todo' | 'inprogress' | 'inreview' | 'done';

export type priorityType = 'LOW' | 'MEDIUM' | 'HIGH';

export type statusType =
  | 'DESIGN'
  | 'DEVELOPMENT'
  | 'FOLLOW-UP'
  | 'TESTING'
  | 'CONTENT'
  | 'MEETING'
  | 'MARKETING';

export type avatarsType = Array<{
  src: string;
  alt: string;
  fallback: string;
}>;

export interface ITask extends Document {
  title: string;
  description: string;
  status: statusType;
  priority: priorityType;
  column: ColumnKey;
  avatars?: avatarsType;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: [
        'DESIGN',
        'DEVELOPMENT',
        'FOLLOW-UP',
        'TESTING',
        'CONTENT',
        'MEETING',
        'MARKETING',
      ],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['LOW', 'MEDIUM', 'HIGH'],
    },
    column: {
      type: String,
      required: [true, 'Column is required'],
      enum: ['todo', 'inprogress', 'inreview', 'done'],
    },
    avatars: [
      {
        src: {
          type: String,
        },
        alt: {
          type: String,
        },
        fallback: {
          type: String,
        },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 4 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const Tasks = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);

export default Tasks;
