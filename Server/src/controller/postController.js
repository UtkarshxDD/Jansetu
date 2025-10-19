import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Bookmark from '../models/bookmarkModel.js';
import Notification from '../models/notificationModel.js';
import mongoose from 'mongoose';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import fetch from 'node-fetch';

// Helper function to extract mentions from content
const extractMentions = (content) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

// Helper function to create notification
const createNotification = async (recipientId, senderId, type, message, postId = null, commentId = null) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      post: postId,
      comment: commentId
    });
    await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, content, city, coordinates, address, tags } = req.body;
    const userId = req.params.userId;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate required fields
    if (!title || !content || !city || !coordinates) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, content, city, and coordinates are required" 
      });
    }

    // Parse coordinates
    let parsedCoordinates;
    try {
      parsedCoordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
      if (!Array.isArray(parsedCoordinates) || parsedCoordinates.length !== 2) {
        throw new Error('Invalid coordinates format');
      }
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid coordinates format. Expected [longitude, latitude]" 
      });
    }

    // Handle image uploads to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadResult = await uploadToCloudinary(file.path, 'jansetu-feed');
          if (uploadResult) {
            images.push({
              url: uploadResult.url,
              publicId: uploadResult.publicId,
              width: uploadResult.width,
              height: uploadResult.height,
              format: uploadResult.format,
              bytes: uploadResult.bytes
            });
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ 
            success: false, 
            message: `Failed to upload image: ${uploadError.message}` 
          });
        }
      }
    }

    // Get address from coordinates using reverse geocoding
    let resolvedAddress = address || '';
    if (parsedCoordinates && parsedCoordinates.length === 2) {
      try {
        const [longitude, latitude] = parsedCoordinates;
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const geocodeData = await geocodeResponse.json();
        if (geocodeData && geocodeData.display_name) {
          resolvedAddress = geocodeData.display_name;
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        // Continue without geocoding if it fails
      }
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (error) {
        parsedTags = [];
      }
    }

    // Extract mentions from content
    const mentionUsernames = extractMentions(content);
    const mentionedUsers = [];
    
    if (mentionUsernames.length > 0) {
      try {
        const users = await User.find({ 
          name: { $in: mentionUsernames.map(username => new RegExp(username, 'i')) }
        });
        mentionedUsers.push(...users.map(user => user._id));
      } catch (error) {
        console.error('Error finding mentioned users:', error);
      }
    }

    // Create post
    const newPost = new Post({
      title,
      content,
      images,
      city: city.toLowerCase().trim(),
      location: {
        type: 'Point',
        coordinates: parsedCoordinates
      },
      address: resolvedAddress,
      author: userId,
      tags: parsedTags,
      mentions: mentionedUsers
    });

    await newPost.save();

    // Populate author information
    await newPost.populate('author', 'name email');
    await newPost.populate('mentions', 'name email');

    // Create notifications for mentioned users
    if (mentionedUsers.length > 0) {
      for (const mentionedUserId of mentionedUsers) {
        if (mentionedUserId.toString() !== userId) { // Don't notify self
          await createNotification(
            mentionedUserId,
            userId,
            'mention',
            `${newPost.author.name} mentioned you in a post`,
            newPost._id
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost
    });

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all posts with filtering and pagination
export const getAllPosts = async (req, res) => {
  try {
    const { 
      city, 
      page = 1, 
      limit = 10, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      lat,
      lng,
      radius = 10 // km
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { isActive: true };

    // City filter
    if (city) {
      query.city = { $regex: new RegExp(city, 'i') };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Location-based search
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInMeters = parseFloat(radius) * 1000;

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const posts = await Post.find(query)
      .populate('author', 'name email')
      .populate('comments.user', 'name')
      .populate('mentions', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limitNum);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPosts,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get posts by city
export const getPostsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await Post.find({ 
      city: { $regex: new RegExp(city, 'i') },
      isActive: true 
    })
      .populate('author', 'name email')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPosts = await Post.countDocuments({ 
      city: { $regex: new RegExp(city, 'i') },
      isActive: true 
    });

    res.status(200).json({
      success: true,
      posts,
      totalPosts,
      currentPage: pageNum,
      totalPages: Math.ceil(totalPosts / limitNum)
    });

  } catch (error) {
    console.error("Error fetching posts by city:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Like/Unlike a post
export const toggleLike = async (req, res) => {
  try {
    const { postId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user already liked the post
    const existingLikeIndex = post.likes.findIndex(like => like.user.toString() === userId);

    if (existingLikeIndex > -1) {
      // Unlike the post
      post.likes.splice(existingLikeIndex, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Like the post
      post.likes.push({ user: userId });
      post.likesCount += 1;
    }

    await post.save();

    // Create notification for like (not for unlike)
    if (existingLikeIndex === -1 && post.author.toString() !== userId) {
      const user = await User.findById(userId);
      await createNotification(
        post.author,
        userId,
        'like',
        `${user.name} liked your post`,
        post._id
      );
    }

    res.status(200).json({
      success: true,
      message: existingLikeIndex > -1 ? "Post unliked" : "Post liked",
      likesCount: post.likesCount,
      isLiked: existingLikeIndex === -1
    });

  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add comment to post
export const addComment = async (req, res) => {
  try {
    const { postId, userId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Add comment
    const newComment = {
      user: userId,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    post.commentsCount += 1;
    await post.save();

    // Populate the new comment with user info
    await post.populate('comments.user', 'name');
    const addedComment = post.comments[post.comments.length - 1];

    // Create notification for comment (not for self)
    if (post.author.toString() !== userId) {
      const user = await User.findById(userId);
      await createNotification(
        post.author,
        userId,
        'comment',
        `${user.name} commented on your post`,
        post._id,
        addedComment._id
      );
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: addedComment,
      commentsCount: post.commentsCount
    });

  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId) || 
        !mongoose.Types.ObjectId.isValid(commentId) || 
        !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(comment => 
      comment._id.toString() === commentId && comment.user.toString() === userId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment not found or you don't have permission to delete it" 
      });
    }

    post.comments.splice(commentIndex, 1);
    post.commentsCount = Math.max(0, post.commentsCount - 1);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      commentsCount: post.commentsCount
    });

  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await Post.find({ author: userId, isActive: true })
      .populate('author', 'name email')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPosts = await Post.countDocuments({ author: userId, isActive: true });

    res.status(200).json({
      success: true,
      posts,
      totalPosts,
      currentPage: pageNum,
      totalPages: Math.ceil(totalPosts / limitNum)
    });

  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const { postId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check if user owns the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to delete this post" 
      });
    }

    // Delete images from Cloudinary
    if (post.images && post.images.length > 0) {
      for (const image of post.images) {
        try {
          await deleteFromCloudinary(image.publicId);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }
    }

    // Soft delete the post
    post.isActive = false;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Toggle bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const { postId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const existingBookmark = await Bookmark.findOne({ user: userId, post: postId });

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.deleteOne({ user: userId, post: postId });
      res.status(200).json({
        success: true,
        message: "Bookmark removed",
        isBookmarked: false
      });
    } else {
      // Add bookmark
      const newBookmark = new Bookmark({ user: userId, post: postId });
      await newBookmark.save();
      res.status(200).json({
        success: true,
        message: "Post bookmarked",
        isBookmarked: true
      });
    }

  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user bookmarks
export const getUserBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const bookmarks = await Bookmark.find({ user: userId })
      .populate({
        path: 'post',
        match: { isActive: true },
        populate: [
          { path: 'author', select: 'name email' },
          { path: 'comments.user', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Filter out bookmarks where post is null (deleted posts)
    const validBookmarks = bookmarks.filter(bookmark => bookmark.post !== null);

    const totalBookmarks = await Bookmark.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      bookmarks: validBookmarks,
      totalBookmarks,
      currentPage: pageNum,
      totalPages: Math.ceil(totalBookmarks / limitNum)
    });

  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Share post
export const sharePost = async (req, res) => {
  try {
    const { postId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid IDs" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check if user already shared this post
    const existingShare = post.shares.find(share => share.user.toString() === userId);
    
    if (!existingShare) {
      post.shares.push({ user: userId });
      post.sharesCount += 1;
      await post.save();

      // Create notification for share (not for self)
      if (post.author.toString() !== userId) {
        const user = await User.findById(userId);
        await createNotification(
          post.author,
          userId,
          'post_share',
          `${user.name} shared your post`,
          post._id
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Post shared successfully",
      sharesCount: post.sharesCount
    });

  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name email')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalNotifications = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({
      success: true,
      notifications,
      totalNotifications,
      unreadCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalNotifications / limitNum)
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark notifications as read
export const markNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const { notificationIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    let updateQuery = { recipient: userId };
    
    if (notificationIds && notificationIds.length > 0) {
      updateQuery._id = { $in: notificationIds };
    }

    await Notification.updateMany(updateQuery, { isRead: true });

    res.status(200).json({
      success: true,
      message: "Notifications marked as read"
    });

  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Increment post views
export const incrementPostViews = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    await Post.findByIdAndUpdate(postId, { $inc: { viewsCount: 1 } });

    res.status(200).json({
      success: true,
      message: "Post view recorded"
    });

  } catch (error) {
    console.error("Error incrementing post views:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get popular cities
export const getPopularCities = async (req, res) => {
  try {
    const cities = await Post.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$city', 
          count: { $sum: 1 },
          latestPost: { $max: '$createdAt' }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          city: '$_id',
          postCount: '$count',
          latestPost: '$latestPost',
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      cities
    });

  } catch (error) {
    console.error("Error fetching popular cities:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
