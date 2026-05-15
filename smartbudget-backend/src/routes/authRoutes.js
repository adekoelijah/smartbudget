

// import express from "express";
// import {
//   signup,
//   login,
//   logout,
//   getCurrentUser,
//   changePassword,
// } from "../config/controllers/authController.js";

// import protect from "../middleware/authMiddleware.js";
// import rateLimit from "../middleware/rateLimitMiddleware.js";

// const router = express.Router();

// /* PUBLIC */
// router.post("/signup", rateLimit("signup"), signup);
// router.post("/login", rateLimit("login"), login);
// router.post("/logout", logout);

// /* PROTECTED */
// router.get("/me", protect, getCurrentUser);
// router.put("/change-password", protect, changePassword);

// export default router;


import express from "express";
import {
  googleAuth,
  googleCallback,
  signup,
  login,
  logout,
  getCurrentUser,
  changePassword,
 
} from "../config/controllers/authController.js";



import protect from "../middleware/authMiddleware.js";
import rateLimit from "../middleware/rateLimitMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

/* PUBLIC */
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

router.post("/signup", rateLimit("signup"), asyncHandler(signup));
router.post("/login", rateLimit("login"), asyncHandler(login));
router.post("/logout", logout);


/* PROTECTED */
router.get("/me", protect, asyncHandler(getCurrentUser));
router.put("/change-password", protect, asyncHandler(changePassword));

export default router;