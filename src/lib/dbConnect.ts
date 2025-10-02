import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;
const DB_NAME = process.env.DB_NAME!;
if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}
if (!DB_NAME) {
  throw new Error("Please define the DB_NAME environment variable");
}

const connectionString = `${MONGO_URI}/${DB_NAME}`;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };
    cached.promise = mongoose
      .connect(connectionString, opts)
      .then(() => mongoose.connection);
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}
