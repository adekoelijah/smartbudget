// import express from "express";
// import asyncHandler from "../utils/asyncHandler.js";
// import { getCurrentUser } from "../config/controllers/userController.js";
// import protect from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.get("/me", protect, asyncHandler(getCurrentUser));

// export default router;


import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { getCurrentUser } from "../config/controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Get logged-in user profile
router.get("/me", protect, asyncHandler(getCurrentUser));

export default router;