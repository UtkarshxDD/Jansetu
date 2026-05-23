import Notification from "../models/notificationModel.js";

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?._id || req.admin?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking notification read:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user?._id || req.admin?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
