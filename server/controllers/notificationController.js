const Notification = require("../models/Notification");

const createNotification = async (recipientId, senderId, type, postId, message) => {
  try {
    if (!recipientId || !senderId) return;
    if (recipientId.toString() === senderId.toString()) return;

    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId || null,
      message,
    });
  } catch (err) {
    console.error("createNotification error:", err.message);
  }
};

const getNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ notifications: [] });
    }

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "name profile_photo")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications: notifications || [] });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ notifications: [], message: error.message || "Failed to fetch notifications" });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOne({ _id: id, recipient: req.user.id });
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    notif.read = true;
    await notif.save();
    res.json({ message: "Marked as read" });
  } catch (error) {
    console.error("markRead error:", error);
    res.status(500).json({ message: error.message || "Failed to mark as read" });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllRead error:", error);
    res.status(500).json({ message: error.message || "Failed to mark all as read" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, recipient: req.user.id });
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("deleteNotification error:", error);
    res.status(500).json({ message: error.message || "Failed to delete notification" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
};