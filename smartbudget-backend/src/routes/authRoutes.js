// // import express from "express";
// // import {
// //   signup,
// //   login,
// //   logout,
// //   getCurrentUser,
// //   refreshToken,
// //   updateProfile,
// //   changePassword,
// // } from "../controllers/authController.js";
// // import protect from "../middleware/authMiddleware.js";
// // import rateLimit from "../middleware/rateLimitMiddleware.js";

// // const router = express.Router();

// // // ✅ Public Routes with Rate Limiting
// // router.post("/signup", rateLimit("signup"), signup);
// // router.post("/login", rateLimit("login"), login);
// // router.post("/logout", logout);

// // // ✅ Protected Routes
// // router.get("/me", protect, getCurrentUser);
// // router.post("/refresh-token", protect, refreshToken);
// // router.put("/profile", protect, updateProfile);
// // router.put("/change-password", protect, changePassword);

// // export default router;


// import express from "express";
// import {
//   signup,
//   login,
//   logout,
//   getCurrentUser,
//   refreshToken,
//   updateProfile,
//   changePassword,
// } from "../config/controllers/authController.js";

// import protect from "../middleware/authMiddleware.js";
// import rateLimit from "../middleware/rateLimitMiddleware.js";

// const router = express.Router();

// router.post("/signup", rateLimit("signup"), signup);
// router.post("/login", rateLimit("login"), login);
// router.post("/logout", logout);

// router.get("/me", protect, getCurrentUser);
// router.post("/refresh-token", protect, refreshToken);
// router.put("/profile", protect, updateProfile);
// router.put("/change-password", protect, changePassword);

// export default router;


// import express from "express";

// import {
//    signup,
//   login,
//   logout,
//   getCurrentUser,
//   refreshToken,
//   updateProfile,
//   changePassword,
// } from  "../config/controllers/authController.js";

// import protect from "../middleware/authMiddleware.js";
// import rateLimit from "../middleware/rateLimitMiddleware.js";

// const router = express.Router();

// /* =========================
//    PUBLIC ROUTES
// ========================= */
// router.post("/signup", rateLimit("signup"), signup);
// router.post("/login", rateLimit("login"), login);

// /* =========================
//    OPTIONAL (REMOVE UNTIL BUILT)
// ========================= */
// router.post("/logout", logout);
// // router.post("/refresh-token", refreshToken);
// router.post("/refresh-token", protect, refreshToken);
// router.put("/updateprofile", protect, updateProfile);

// /* =========================
//    PROTECTED ROUTES
// ========================= */
// router.get("/me", protect, getCurrentUser);
// router.put("/change-password", protect, changePassword);

// export default router;

import express from "express";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  changePassword,
} from "../config/controllers/authController.js";

import protect from "../middleware/authMiddleware.js";
import rateLimit from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

/* PUBLIC */
router.post("/signup", rateLimit("signup"), signup);
router.post("/login", rateLimit("login"), login);
router.post("/logout", logout);

/* PROTECTED */
router.get("/me", protect, getCurrentUser);
router.put("/change-password", protect, changePassword);

export default router;