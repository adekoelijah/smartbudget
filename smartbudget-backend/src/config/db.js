// import mongoose from "mongoose";

// const connectDB = async () => {
//   if (!process.env.MONGO_URI) {
//     console.error("Missing MONGO_URI environment variable.");
//     process.exit(1);
//   }

//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       autoIndex: false,
//     });
//     console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error("MongoDB connection failed:", error.message);
//     process.exit(1);
//   }
// };

// export default connectDB;


// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 10000,
//     });

//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error("MongoDB connection failed:", error.message);

//     // Retry instead of crash
//     setTimeout(connectDB, 5000);
//   }
// };

// export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    throw err; // important so server knows it failed
  }
};

export default connectDB;