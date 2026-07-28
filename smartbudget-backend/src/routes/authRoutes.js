

// import express from "express";
// import {
//   googleAuth,
//   googleCallback,
//   signup,
//   login,
//   logout,
//   getCurrentUser,
//   changePassword,
 
// } from "../config/controllers/authController.js";


import express from "express";
import {
  googleAuth,
  googleCallback,
  signup,
  login,
  logout,
  getCurrentUser,
  changePassword,

  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken,

} from "../config/controllers/authController.js";




import protect from "../middleware/authMiddleware.js";
import rateLimit from "../middleware/rateLimitMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

/* PUBLIC */
router.get("/google", googleAuth);
// router.get("/google/callback", googleCallback);

router.get(
 "/google/callback",
 (req,res,next)=>{
   console.log("🔥 GOOGLE CALLBACK ROUTE HIT");
   console.log("QUERY:", req.query);
   next();
 },
 googleCallback
);

router.post("/signup", rateLimit("signup"), asyncHandler(signup));
router.post("/login", rateLimit("login"), asyncHandler(login));
router.post(
    "/refresh-token",
    asyncHandler(refreshAccessToken)
);

router.get(
    "/verify-email/:token",
    asyncHandler(verifyEmail)
);

router.post(
    "/resend-verification",
    rateLimit("verification"),
    asyncHandler(resendVerificationEmail)
);

router.post(
    "/forgot-password",
    rateLimit("forgot-password"),
    asyncHandler(forgotPassword)
);

router.post(
    "/reset-password/:token",
    asyncHandler(resetPassword)
);
// router.post("/logout", logout);
router.post(
    "/logout",
    protect,
    asyncHandler(logout)
);




/* PROTECTED */
router.get("/me", protect, asyncHandler(getCurrentUser));
router.put("/change-password", protect, asyncHandler(changePassword));

export default router;

