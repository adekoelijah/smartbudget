// import dotenv from "dotenv";
// import app from "./src/app.js";
// import connectDB from "./src/config/db.js";
// import authRoutes from "./routes/authRoutes.js";


// dotenv.config();

// if (!process.env.JWT_SECRET) {
//   console.error("Missing JWT_SECRET environment variable.");
//   process.exit(1);
// }


// connectDB();

// const PORT = Number(process.env.PORT) || 5000;
// const NODE_ENV = process.env.NODE_ENV || "development";

// const server = app.listen(PORT, () => {
//   console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
// });

// process.on("unhandledRejection", (error) => {
//   console.error("Unhandled Rejection:", error);
//   server.close(() => process.exit(1));
// });

// process.on("uncaughtException", (error) => {
//   console.error("Uncaught Exception:", error);
//   process.exit(1);
// });






// import dotenv from "dotenv";
// import app from "./src/app.js";
// import connectDB from "./src/config/db.js";



// dotenv.config();

// if (!process.env.JWT_SECRET) {
//   console.error("❌ Missing JWT_SECRET environment variable.");
//   process.exit(1);
// }

// // Connect database
// connectDB();

// const PORT = Number(process.env.PORT) || 5000;
// const NODE_ENV = process.env.NODE_ENV || "development";

// const server = app.listen(PORT, () => {
//   console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
// });

// // Handle rejected promises
// process.on("unhandledRejection", (error) => {
//   console.error("❌ Unhandled Rejection:", error.message);
//   server.close(() => process.exit(1));
// });

// // Handle uncaught exceptions
// process.on("uncaughtException", (error) => {
//   console.error("❌ Uncaught Exception:", error.message);
//   // process.exit(1);
// });

// // New filed added

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));



// last working server

// import dotenv from "dotenv";
// import app from "./src/app.js";
// import connectDB from "./src/config/db.js";

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });

//   } catch (err) {
//     console.error("❌ Server failed to start:", err.message);
//   }
// };

// startServer();


//new server





import dotenv from "dotenv";
import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Startup error:", error);
  }
};


startServer();