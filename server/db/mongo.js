import mongoose from "mongoose";

let isConnected = false;

export async function connectMongo(uri) {
  const mongoUri = uri || process.env.MONGODB_URL;
  if (!mongoUri) {
    console.warn("MONGODB_URI is not set. API will run with in-memory fallback where applicable.");
    return null;
  }

  if (isConnected) return mongoose.connection;

  try {
    mongoose.set("strictQuery", true);
    mongoose.set("bufferCommands", false);
    mongoose.set("bufferTimeoutMS", 0);
    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log("✅ Connected to MongoDB");
    return mongoose.connection;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

export function getMongoConnection() {
  if (!isConnected) return null;
  return mongoose.connection;
}
