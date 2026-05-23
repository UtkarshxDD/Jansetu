import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ProblemReport from "../models/problemModel.js";
import User from "../models/userModel.js";
import Official from "../models/officialModel.js";
import mongoose from "mongoose";

const createAdminToken = (adminId) => {
  return jwt.sign({ _id: adminId, role: 'admin' }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Credentials from environment variables (never hardcode in source)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@jansetu.com";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
    if (!process.env.ADMIN_EMAIL) {
      console.warn("⚠️  ADMIN_EMAIL not set in env — using default. Set it before production.");
    }
    
    // Check if credentials match
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create admin object for response
    const adminData = {
      _id: "admin_001",
      name: "System Administrator",
      email: ADMIN_EMAIL,
      role: "super_admin",
      permissions: {
        canViewComplaints: true,
        canUpdateComplaints: true,
        canDeleteComplaints: true,
        canAssignOfficials: true,
        canManageUsers: true
      }
    };

    const token = createAdminToken(adminData._id);
    res
      .cookie("adminToken", token, { httpOnly: true, secure: true, sameSite: "strict" })
      .status(200)
      .json({ 
        message: "Admin Login Successful", 
        admin: adminData, 
        token 
      });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

export const adminLogout = async (req, res) => {
  try {
    res
      .clearCookie("adminToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
      })
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
      })
      .status(200)
      .json({ message: "Admin logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const complaints = await ProblemReport.find(filter)
      .populate('createdBy', 'name email phone')
      .populate('assignedTo', 'name department')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ProblemReport.countDocuments(filter);

    const formattedComplaints = complaints.map(complaint => ({
      ...complaint,
      _id: complaint._id.toString(),
      createdBy: complaint.createdBy ? {
        _id: complaint.createdBy._id.toString(),
        name: complaint.createdBy.name,
        email: complaint.createdBy.email,
        phone: complaint.createdBy.phone
      } : null,
      assignedTo: complaint.assignedTo ? {
        _id: complaint.assignedTo._id.toString(),
        name: complaint.assignedTo.name,
        department: complaint.assignedTo.department
      } : null
    }));

    res.status(200).json({
      success: true,
      complaints: formattedComplaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }

    const complaint = await ProblemReport.findById(complaintId)
      .populate('createdBy', 'name email phone')
      .populate('assignedTo', 'name department')
      .lean();

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const formattedComplaint = {
      ...complaint,
      _id: complaint._id.toString(),
      createdBy: complaint.createdBy ? {
        _id: complaint.createdBy._id.toString(),
        name: complaint.createdBy.name,
        email: complaint.createdBy.email,
        phone: complaint.createdBy.phone
      } : null,
      assignedTo: complaint.assignedTo ? {
        _id: complaint.assignedTo._id.toString(),
        name: complaint.assignedTo.name,
        department: complaint.assignedTo.department
      } : null
    };

    res.status(200).json({
      success: true,
      complaint: formattedComplaint
    });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, assignedTo, adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }

    const complaint = await ProblemReport.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (adminNotes) updateData.adminNotes = adminNotes;

    const updatedComplaint = await ProblemReport.findByIdAndUpdate(
      complaintId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email').populate('assignedTo', 'name department');

    if (status && status !== complaint.status) {
      import('../utils/notificationUtils.js').then(({ createNotification }) => {
        createNotification({
          recipient: complaint.createdBy,
          recipientModel: 'User',
          type: 'status_update',
          message: `Your issue "${complaint.title}" status changed to ${status.replace('_', ' ')}`,
          problem: complaint._id
        });
      });
      import('../index.js').then(({ io }) => {
        if (io) io.emit('status_updated', { issueId: complaint._id.toString(), status });
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }

    const complaint = await ProblemReport.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Remove from official's assigned problems if assigned
    if (complaint.assignedTo) {
      await Official.findByIdAndUpdate(complaint.assignedTo, {
        $pull: { assignedProblems: complaintId }
      });
    }

    await ProblemReport.findByIdAndDelete(complaintId);

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Single aggregation replaces 5 separate countDocuments calls
    const [statsResult] = await ProblemReport.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          pending: [{ $match: { status: "pending" } }, { $count: "count" }],
          underReview: [{ $match: { status: "under_review" } }, { $count: "count" }],
          assigned: [{ $match: { status: "assigned" } }, { $count: "count" }],
          resolved: [{ $match: { status: "resolved" } }, { $count: "count" }],
          byCategory: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdBy",
                pipeline: [{ $project: { name: 1 } }]
              }
            },
            { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } }
          ]
        }
      }
    ]);

    const [totalUsers, totalOfficials] = await Promise.all([
      User.countDocuments(),
      Official.countDocuments()
    ]);

    const extract = (arr) => (arr?.[0]?.count ?? 0);

    res.status(200).json({
      success: true,
      stats: {
        totalComplaints: extract(statsResult.total),
        pendingComplaints: extract(statsResult.pending),
        underReviewComplaints: extract(statsResult.underReview),
        assignedComplaints: extract(statsResult.assigned),
        resolvedComplaints: extract(statsResult.resolved),
        totalUsers,
        totalOfficials
      },
      complaintsByCategory: statsResult.byCategory,
      recentComplaints: (statsResult.recent || []).map(complaint => ({
        ...complaint,
        _id: complaint._id.toString(),
        createdBy: complaint.createdBy
          ? { _id: complaint.createdBy._id?.toString(), name: complaint.createdBy.name }
          : null
      }))
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const assignComplaintToOfficial = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { officialId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(complaintId) || !mongoose.Types.ObjectId.isValid(officialId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const complaint = await ProblemReport.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const official = await Official.findById(officialId);
    if (!official) {
      return res.status(404).json({ success: false, message: "Official not found" });
    }

    // Update complaint
    complaint.assignedTo = officialId;
    complaint.status = 'assigned';
    await complaint.save();

    // Add to official's assigned problems
    official.assignedProblems.push(complaintId);
    await official.save();

    res.status(200).json({
      success: true,
      message: `Complaint assigned to ${official.name}`,
      complaint
    });
  } catch (error) {
    console.error("Error assigning complaint:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}; 

// List officials for assignment with simple filters
export const getOfficials = async (req, res) => {
  try {
    const { q, department, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { department: { $regex: q, $options: "i" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const officials = await Official.find(filter)
      .select("name email department assignedProblems completedProblems")
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Official.countDocuments(filter);
    const formatted = officials.map(o => ({
      _id: o._id.toString(),
      name: o.name,
      email: o.email,
      department: o.department,
      assignedCount: Array.isArray(o.assignedProblems) ? o.assignedProblems.length : 0,
      completedCount: Array.isArray(o.completedProblems) ? o.completedProblems.length : 0,
    }));

    res.status(200).json({
      success: true,
      officials: formatted,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching officials:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Civic Leaderboard — top citizens by complaints reported & resolved
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await ProblemReport.aggregate([
      {
        $group: {
          _id: "$createdBy",
          totalReported: { $sum: 1 },
          totalResolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          },
          totalVotes: { $sum: "$voteCount" },
          avgRating: { $avg: "$averageRating" }
        }
      },
      { $sort: { totalResolved: -1, totalReported: -1, totalVotes: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { name: 1, email: 1, points: 1 } }]
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: { $ifNull: ["$user.name", "Anonymous"] },
          email: "$user.email",
          totalReported: 1,
          totalResolved: 1,
          totalVotes: 1,
          avgRating: { $round: ["$avgRating", 1] },
          score: {
            $add: [
              { $ifNull: ["$user.points", 0] },
              { $multiply: ["$totalResolved", 10] },
              { $multiply: ["$totalReported", 2] },
              "$totalVotes"
            ]
          }
        }
      },
      { $sort: { score: -1 } }
    ]);

    res.status(200).json({
      success: true,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        ...entry
      }))
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const exportComplaintsCSV = async (req, res) => {
  try {
    const complaints = await ProblemReport.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    const headers = ['ID', 'Title', 'Category', 'Status', 'Priority', 'Severity', 'Votes', 'Created By', 'Created At'];
    const rows = complaints.map(c => [
      c._id.toString(),
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.status,
      c.priority,
      c.averageRating || c.rating || 0,
      c.upvotedBy ? c.upvotedBy.length : 0,
      c.createdBy ? `"${c.createdBy.name}"` : 'Unknown',
      new Date(c.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jansetu_issues.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export CSV error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};