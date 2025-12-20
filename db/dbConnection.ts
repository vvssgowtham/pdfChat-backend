import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const DB_URL: string = process.env.DB_URI || "mongodb://localhost:27017/";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log(`Connected to DB!!!!`);
  } catch (error: unknown) {
    console.error("Error connecting to DB");
    throw error;
  }
};

export default connectDB;
