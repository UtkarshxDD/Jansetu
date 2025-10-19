import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Official from "../models/officialModel.js"

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.cookies?.adminToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decodedToken?._id;
    const userRole = decodedToken?.role;

    // Handle admin tokens
    if (userRole === 'admin' || userId === 'admin_001') {
      const adminUser = {
        _id: 'admin_001',
        name: 'System Administrator',
        email: 'admin@jansetu.com',
        role: 'admin',
        permissions: {
          canViewComplaints: true,
          canUpdateComplaints: true,
          canDeleteComplaints: true,
          canAssignOfficials: true,
          canManageUsers: true
        }
      };
      req.user = adminUser;
      req.user.role = 'admin';
      return next();
    }

    // Handle regular users and officials
    let user = await User.findById(userId).select("-password -refreshToken");
    let role = "user";

    if (!user) {
      user = await Official.findById(userId).select("-password -refreshToken");
      role = "official";
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    req.user = user;
    req.user.role = role;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized or invalid token" });
  }
};

// Export as authMiddleware for backward compatibility
export const authMiddleware = verifyJWT;