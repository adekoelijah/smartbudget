


import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    console.log("⏳ Connecting to MongoDB...");

    const conn = await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}`
    );
  } catch (error) {
    console.error(
      "❌ MongoDB Connection Error:"
    );

    console.error(error.message);
    console.log(process.env.MONGO_URI);

    process.exit(1);
  }
};

export default connectDB;