import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getPreferences,
  updatePreferences,
  updatePreference,
  resetPreferences,
} from "../config/controllers/preferenceController.js";

const router = express.Router();

/*
==================================================
ALL PREFERENCE ROUTES REQUIRE AUTHENTICATION
==================================================
*/

router.use(protect);

/*
==================================================
GET USER PREFERENCES
GET /api/preferences
==================================================
*/

router.get(
  "/",
  getPreferences
);

/*
==================================================
UPDATE ALL PREFERENCES
PUT /api/preferences
==================================================
*/

router.put(
  "/",
  updatePreferences
);

/*
==================================================
UPDATE SINGLE PREFERENCE
PATCH /api/preferences
==================================================
*/

router.patch(
  "/",
  updatePreference
);

/*
==================================================
RESET PREFERENCES
POST /api/preferences/reset
==================================================
*/

router.post(
  "/reset",
  resetPreferences
);

export default router;