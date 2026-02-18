// MongoDB connection utility
// TODO: Implement database connection

import mongoose, { Connection } from 'mongoose';

const cached: { conn: Connection | null; promise: Promise<Connection> | null } =
  {
    conn: null,
    promise: null,
  };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    cached.promise = mongoose
      .connect(process.env.MONGO_URI!)
      .then((mongoose) => mongoose.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
export default dbConnect;
