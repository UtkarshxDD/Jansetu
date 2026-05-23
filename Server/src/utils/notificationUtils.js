import Notification from '../models/notificationModel.js';
import Admin from '../models/adminModel.js';

/**
 * Create a notification and optionally emit it via socket.io
 */
export const createNotification = async ({
  recipient,
  recipientModel = 'User',
  sender = null,
  type,
  message,
  problem = null,
  post = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      recipientModel,
      sender,
      type,
      message,
      problem,
      post
    });

    // Attempt to emit via socket.io if available
    import('../index.js').then(({ io }) => {
      if (io) {
        io.emit(`notification_${recipient}`, notification);
      }
    }).catch(() => {});

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

/**
 * Broadcast a notification to all Admins
 */
export const notifyAdmins = async ({ type, message, problem = null, sender = null }) => {
  try {
    const admins = await Admin.find({});
    const promises = admins.map(admin => 
      createNotification({
        recipient: admin._id,
        recipientModel: 'Admin',
        sender,
        type,
        message,
        problem
      })
    );
    await Promise.all(promises);
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
};
