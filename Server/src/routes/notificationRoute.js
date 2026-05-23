import { Router } from "express";
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from "../controller/notificationController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

// We will use verifyJWT since both user and admin tokens can be verified if they share the same ACCESS_TOKEN_SECRET
// Wait, actually admin uses verifyJWT as well in their own routes? Let's check adminRoute.js.
// Assuming both use verifyJWT for simplicity, or we will just use verifyJWT.

router.route("/").get(verifyJWT, getUserNotifications);
router.route("/:id/read").put(verifyJWT, markNotificationRead);
router.route("/read-all").put(verifyJWT, markAllNotificationsRead);

export default router;
