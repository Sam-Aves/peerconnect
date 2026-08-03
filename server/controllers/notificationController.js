const Notification = require("../models/Notification");

const createNotification = async (recipientId, senderId, type, postId, message) => {
  try {
    if (recipientId.toString() === senderId.toString()) return;
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
      message,
    });
    console.log("✅ Notification created");
  } catch (error) {
    console.error("❌ Error creating notification:", error);
  }
};

const getNotifications = async (req, res) => {
  try {
    console.log("📡 Fetching notifications for user:", req.user?.id);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ notifications: [] });
    }

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "name")
      .populate("post", "content")
      .sort({ createdAt: -1 })
      .limit(50);

    // সেফটি – সবসময় array return করবে
    const safeNotifications = notifications || [];
    console.log(`✅ Found ${safeNotifications.length} notifications`);

    res.json({ notifications: safeNotifications });

  } catch (error) {
    console.error("❌ Error in getNotifications:", error);
    // Error হলেও empty array return করবে
    res.status(500).json({ notifications: [], message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Not found" });
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    notification.read = true;
    await notification.save();
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
};