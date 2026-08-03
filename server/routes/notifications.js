const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

// GET    /api/notifications          – fetch all for current user
router.get("/", protect, getNotifications);

// PATCH  /api/notifications/read-all – mark all as read
router.patch("/read-all", protect, markAllRead);

// PATCH  /api/notifications/:id/read – mark one as read
router.patch("/:id/read", protect, markRead);

// DELETE /api/notifications/:id      – delete one
router.delete("/:id", protect, deleteNotification);

module.exports = router;