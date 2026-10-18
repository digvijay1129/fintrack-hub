import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectToDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 7000,
    autoIndex: env.NODE_ENV !== "production"
  });
  return mongoose.connection;
}

export function getDatabaseState() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  return states[mongoose.connection.readyState] ?? "unknown";
}
