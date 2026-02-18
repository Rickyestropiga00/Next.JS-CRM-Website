// MongoDB connection utility
// TODO: Implement database connection

import mongoose, { Connection } from 'mongoose';

const cached: { conn: Connection | null; promise: Promise<Connection> | null } =
  {
    conn: null,
    promise: null,
  };

async function dbConnect() {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }
      cached.promise = mongoose
        .connect(process.env.MONGODB_URI!)
        .then((mongoose) => mongoose.connection);
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
export default dbConnect;
