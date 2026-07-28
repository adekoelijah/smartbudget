import express from "express";


import {
  changePassword,
  enableTwoFactor,
  disableTwoFactor,
  getLoginActivity,
  revokeSession,
  logoutAllDevices,
} from "../controllers/securityController.js";


import protect from "../middleware/authMiddleware.js";



const router = express.Router();





/*
==================================================
ALL SECURITY ROUTES REQUIRE AUTHENTICATION
==================================================
*/


router.use(protect);









/*
==================================================
PASSWORD MANAGEMENT
==================================================
*/


router.put(
  "/change-password",
  changePassword
);









/*
==================================================
TWO FACTOR AUTHENTICATION
==================================================
*/


router.post(
  "/2fa/enable",
  enableTwoFactor
);



router.post(
  "/2fa/disable",
  disableTwoFactor
);









/*
==================================================
LOGIN ACTIVITY
==================================================
*/


router.get(
  "/activity",
  getLoginActivity
);









/*
==================================================
SESSION MANAGEMENT
==================================================
*/


router.delete(
  "/session/:sessionId",
  revokeSession
);



router.post(
  "/logout-all",
  logoutAllDevices
);



export default router;