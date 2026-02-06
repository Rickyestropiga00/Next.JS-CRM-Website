// Global TypeScript declarations
// TODO: Add mongoose global type declarations


import mongoose from 'mongoose';
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}
export {};