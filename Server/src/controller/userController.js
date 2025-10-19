import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ProblemReport from "../models/problemModel.js";
import Comment from "../models/commentModel.js";
import mongoose from "mongoose";

const createToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

export const signupUser = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;
    
    // Validation
    if (!name || !email || !password || !phone || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (!location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({ message: "Valid location coordinates are required" });
    }

    const [longitude, latitude] = location.coordinates;
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return res.status(400).json({ message: "Coordinates must be numbers" });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: "Longitude must be between -180 and 180" });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: "Latitude must be between -90 and 90" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
    });

    const token = createToken(newUser._id);
    res
      .cookie("accessToken", token, { httpOnly: true, secure: true })
      .status(201)
      .json({ message: "Signup successful", user: newUser });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: "Signup error", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exists" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    const token = createToken(user._id);
    res
      .cookie("accessToken", token, { httpOnly: true, secure: true, sameSite: "strict" })
      .status(200)
      .json({ message: "Login Successful", user , token});
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
}

export const logout = async (req, res) => {
  try {
    res
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
      })
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
};

export const addCommentToProblem = async (req, res) => {
  try {
    const { problemId, userId } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    }

    const problem = await ProblemReport.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    const newComment = await Comment.create({
      comment,
      userMade: userId,
      toProblem: problemId,
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId, userId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.userMade.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own comment" });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getCommentsForProblem = async (req, res) => {
  try {
      const { problemId } = req.params;
      const problem = await ProblemReport.findById(problemId);
      if (!problem) {
          return res.status(404).json({ success: false, message: "Problem not found" });
      }

      const comments = await Comment.find({ toProblem: problemId })

      res.status(200).json({
          success: true,
          comments,
      });
  } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        address: user.address,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, location, address } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if email is being changed and if it's already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name || existingUser.name,
        email: email || existingUser.email,
        phone: phone || existingUser.phone,
        location: location || existingUser.location,
        address: address || existingUser.address
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};