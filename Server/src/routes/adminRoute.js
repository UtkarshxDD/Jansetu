import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { 
  adminLogin, 
  adminLogout, 
  getAllComplaints, 
  getComplaintById, 
  updateComplaintStatus, 
  deleteComplaint, 
  getDashboardStats, 
  assignComplaintToOfficial, 
  getOfficials 
} from "../controller/adminController.js";

const router = Router();

// Admin authentication (hardcoded credentials)
router.route("/login").post(adminLogin);
router.route("/logout").post(verifyJWT, adminLogout);

// Dashboard
router.route("/dashboard/stats").get(verifyJWT, getDashboardStats);

// Complaints management
router.route("/complaints").get(verifyJWT, getAllComplaints);
router.route("/complaints/:complaintId").get(verifyJWT, getComplaintById);
router.route("/complaints/:complaintId/status").put(verifyJWT, updateComplaintStatus);
router.route("/complaints/:complaintId").delete(verifyJWT, deleteComplaint);
router.route("/complaints/:complaintId/assign").post(verifyJWT, assignComplaintToOfficial);

// Officials listing
router.route("/officials").get(verifyJWT, getOfficials);

export default router; 