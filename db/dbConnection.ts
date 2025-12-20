import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const DB_URL: string = process.env.DB_URI || "mongodb://localhost:27017/";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL, {
      bufferCommands: false, // Disable buffering, fail fast if not connected
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`Connected to DB!!!!`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected successfully");
    });
  } catch (error: unknown) {
    console.error("Error connecting to DB:", error);
    throw error;
  }
};

export default connectDB;
