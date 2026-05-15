


import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import protect from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

import {
  getCurrentUser,
  updateCurrentUser,
  uploadAvatarController,
} from "../config/controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateCurrentUser);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatarController);

export default router;