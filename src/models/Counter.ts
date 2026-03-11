import mongoose, { Document, Schema } from 'mongoose';

export interface ICounter extends Document {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: {
    type: String,
    required: [true, 'Counter ID is required'],
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter =
  mongoose.models.Counter || mongoose.model<ICounter>('Counter', counterSchema);

export default Counter;
