

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// // 📦 ROUTES
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import budgetRoutes from "./routes/budgetRoutes.js";
// import transactionRoutes from "./routes/transactionRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js"; // ✅ NEW


// // current added files before crash
// import exportRoutes from "./routes/exportRoutes.js"; 

// const app = express();

// /* ===============================
//    SECURITY + PERFORMANCE MIDDLEWARE
// ================================= */



// app.use(helmet());
// app.use(morgan("dev"));


// /* ===============================
//    BODY PARSER
// ================================= */
// app.use(cors(corsOptions));

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));


// /* ===============================
//    CORS CONFIG (FINTECH SAFE)
// ================================= */

// // const allowedOrigins = (
// //   process.env.CORS_ORIGINS ||
// //   "http://localhost:5173",
// //  "https://nexatech-smartbudget.vercel.app"
// // )
// //   .split(",")
// //   .map((origin) => origin.trim());

// // app.use(
// //   cors({
// //     origin: (origin, callback) => {
// //       // allow server-to-server / postman
// //       if (!origin) return callback(null, true);

// //       if (allowedOrigins.includes(origin)) {
// //         return callback(null, true);
// //       }

// //       return callback(new Error(`CORS blocked: ${origin}`));
// //     },
// //     credentials: true,
// //     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
// //   })
// // );

// // // app.options("*", cors());
// // const corsOptions = {
// //   origin(origin, callback) {
// //     if (!origin) return callback(null, true);

// //     if (allowedOrigins.includes(origin)) {
// //       return callback(null, true);
// //     }

// //     return callback(new Error(`CORS blocked: ${origin}`));
// //   },
// //   credentials: true,
// //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
// // };

// // app.use(cors(corsOptions));
// // app.options("*", cors(corsOptions));

// /* ===============================
//    TRUST PROXY (for deploy)
// ================================= */

// /* ===============================
//    CORS CONFIG
// ================================= */


// /* ===============================
//    CORS CONFIG
// ================================= */
// // New code that is correct
// // const allowedOrigins = [
// //   "http://localhost:5173",
// //   "https://nexatech-smartbudget.vercel.app",
// // ];

// // const corsOptions = {
// //   origin(origin, callback) {
// //     if (!origin) return callback(null, true);

// //     console.log("Incoming Origin:", origin);

// //     if (allowedOrigins.includes(origin)) {
// //       return callback(null, true);
// //     }

// //     return callback(new Error(`Origin ${origin} not allowed by CORS`));
// //   },

// //   credentials: true,

// //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

// //   allowedHeaders: [
// //     "Content-Type",
// //     "Authorization",
// //   ],
// // };

// // app.use(cors(corsOptions));

// // new test to get the error 

// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://nexatech-smartbudget.vercel.app",
// ];


// const corsOptions = {
//   origin: (origin, callback) => {

//     console.log("CORS REQUEST FROM:", origin);

//     if (!origin) {
//       return callback(null, true);
//     }

//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     return callback(new Error(`Blocked by CORS: ${origin}`));
//   },

//   credentials: true,

//   methods: [
//     "GET",
//     "POST",
//     "PUT",
//     "PATCH",
//     "DELETE",
//     "OPTIONS",
//   ],

//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//   ],
// };


// /* ===============================
//    HEALTH CHECKS (IMPORTANT FOR SAAS)
// ================================= */

// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     service: "SmartBudget API",
//     status: "running",
//     env: process.env.NODE_ENV || "production",
//   });
// });

// app.get("/api/db-test", async (req, res) => {
//   try {
//     const status = mongoose.connection.readyState;

//     res.json({
//       success: status === 1,
//       mongodb:
//         status === 1
//           ? "connected"
//           : "not connected",
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });

// /* ===============================
//    API ROUTES (CORE SYSTEM)
// ================================= */

// // app.use("/api/auth", authRoutes);
// // app.use("/api/users", userRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/budgets", budgetRoutes);
// app.use("/api/transactions", transactionRoutes);
// app.use("/api/export", exportRoutes);

// /* ===============================
//    📊 FINTECH DASHBOARD LAYER (FIXED)
// ================================= */

// app.use("/api/dashboard", dashboardRoutes);


// // ADD THIS
// app.get("/", (req, res) => {
//   res.json({
//     success: true,
//     message: "SmartBudget API is running 🚀",
//   });
// });

// /* ===============================
//    404 HANDLER (API SAFE)
// ================================= */

// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.originalUrl}`,
//   });
// });

// /* ===============================
//    GLOBAL ERROR HANDLER
// ================================= */

// app.use((err, req, res, next) => {
//   console.error("🔥 Server Error:", err);

//   res.status(err.status || 500).json({
//     success: false,
//     message:
//       process.env.NODE_ENV === "production"
//         ? "Internal Server Error"
//         : err.message,
//   });
// });

// export default app;


import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// ===============================
// ROUTES
// ===============================

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";


const app = express();

app.use((req, res, next) => {

  console.log(
    "REQUEST:",
    req.method,
    req.originalUrl
  );

  next();

});


// ===============================
// TRUST PROXY
// Required for Vercel, reverse proxies,
// rate limiting, secure cookies
// ===============================

app.set("trust proxy", 1);


// ===============================
// SECURITY MIDDLEWARE
// ===============================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);


app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);


// ===============================
// CORS CONFIGURATION
// ===============================

const allowedOrigins = [
  "http://localhost:5173",
  "https://nexatech-smartbudget.vercel.app",
];


const corsOptions = {

  origin: (origin, callback) => {

    // Allow:
    // - Postman
    // - server-to-server calls
    // - mobile applications

    if (!origin) {
      return callback(null, true);
    }


    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }


    console.warn(
      "Blocked CORS origin:",
      origin
    );


    return callback(
      new Error("Not allowed by CORS")
    );
  },


  credentials: true,


  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],


  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};


app.use(cors(corsOptions));


// ===============================
// BODY PARSING
// ===============================

app.use(
  express.json({
    limit: "10mb",
  })
);


app.use(
  express.urlencoded({
    extended: true,
  })
);


// ===============================
// HEALTH CHECKS
// ===============================


app.get("/api/health", (req, res)=>{

  res.status(200).json({

    success:true,

    service:"SmartBudget API",

    status:"running",

    environment:
      process.env.NODE_ENV || "development",

    timestamp:
      new Date().toISOString(),

  });

});



app.get("/api/db-test", (req,res)=>{

  const states = [
    "disconnected",
    "connected",
    "connecting",
    "disconnecting",
  ];


  const state =
    mongoose.connection.readyState;


  res.status(200).json({

    success:
      state === 1,

    mongodb:
      states[state] || "unknown",

  });

});


// ===============================
// API ROUTES
// ===============================


app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/users",
  userRoutes
);


app.use(
  "/api/budgets",
  budgetRoutes
);


app.use(
  "/api/transactions",
  transactionRoutes
);


app.use(
  "/api/dashboard",
  dashboardRoutes
);


app.use(
  "/api/export",
  exportRoutes
);


// ===============================
// ROOT ROUTE
// ===============================

app.get("/", (req,res)=>{

  res.status(200).json({

    success:true,

    message:
      "SmartBudget API is running 🚀",

  });

});


app.get("/api/", (req, res) => {
  res.json({
    success: true,
    message: "SmartBudget API endpoint",
    version: "1.0.0"
  });
});

// ===============================
// 404 HANDLER
// ===============================

app.use(
  (req,res)=>{

    res.status(404).json({

      success:false,

      message:
        `Route not found: ${req.originalUrl}`,

    });

  }
);


// ===============================
// GLOBAL ERROR HANDLER
// ===============================

app.use(
  (err,req,res,next)=>{

    console.error(
      "SERVER ERROR:",
      err
    );


    if(err.message === "Not allowed by CORS"){

      return res.status(403).json({

        success:false,

        message:
          "CORS policy blocked this request",

      });

    }


    res.status(
      err.status || 500
    )
    .json({

      success:false,

      message:
        process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,

    });

  }
);


export default app;