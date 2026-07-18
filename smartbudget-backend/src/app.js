

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// 📦 ROUTES
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"; // ✅ NEW


// current added files before crash
import exportRoutes from "./routes/exportRoutes.js"; 

const app = express();

/* ===============================
   SECURITY + PERFORMANCE MIDDLEWARE
================================= */

app.use(helmet());
app.use(morgan("dev"));

/* ===============================
   BODY PARSER
================================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));


/* ===============================
   CORS CONFIG (FINTECH SAFE)
================================= */

const allowedOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:5000",
  "https://smartbudgets.vercel.app/"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server / postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// app.options("*", cors());
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ===============================
   TRUST PROXY (for deploy)
================================= */

app.set("trust proxy", 1);

/* ===============================
   HEALTH CHECKS (IMPORTANT FOR SAAS)
================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "SmartBudget API",
    status: "running",
    env: process.env.NODE_ENV || "development",
  });
});

app.get("/api/db-test", async (req, res) => {
  try {
    const status = mongoose.connection.readyState;

    res.json({
      success: status === 1,
      mongodb:
        status === 1
          ? "connected"
          : "not connected",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ===============================
   API ROUTES (CORE SYSTEM)
================================= */

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/export", exportRoutes);

/* ===============================
   📊 FINTECH DASHBOARD LAYER (FIXED)
================================= */

app.use("/api/dashboard", dashboardRoutes);


// ADD THIS
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SmartBudget API is running 🚀",
  });
});

/* ===============================
   404 HANDLER (API SAFE)
================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* ===============================
   GLOBAL ERROR HANDLER
================================= */

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

export default app;