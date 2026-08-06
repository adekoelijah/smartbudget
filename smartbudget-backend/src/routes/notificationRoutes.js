import express from "express";


import protect from "../middleware/authMiddleware.js";


import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../config/controllers/notificationController.js";





const router = express.Router();





/*
==================================================
ALL NOTIFICATION ROUTES REQUIRE AUTHENTICATION
==================================================
*/


router.use(protect);







/*
==================================================
NOTIFICATION LIST
==================================================
*/


router.get(
  "/",
  getNotifications
);





router.get(
  "/unread-count",
  getUnreadCount
);









/*
==================================================
READ MANAGEMENT
==================================================
*/


router.patch(
  "/:id/read",
  markNotificationAsRead
);





router.patch(
  "/read-all",
  markAllNotificationsAsRead
);









/*
==================================================
DELETE MANAGEMENT
==================================================
*/


router.delete(
  "/:id",
  deleteNotification
);





router.delete(
  "/",
  clearNotifications
);









/*
==================================================
NOTIFICATION PREFERENCES
==================================================
*/


router.get(
  "/preferences",
  getNotificationPreferences
);





router.put(
  "/preferences",
  updateNotificationPreferences
);







export default router;