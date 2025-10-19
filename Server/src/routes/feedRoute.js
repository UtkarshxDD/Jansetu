import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createPost,
  getAllPosts,
  getPostsByCity,
  toggleLike,
  addComment,
  deleteComment,
  getUserPosts,
  deletePost,
  getPopularCities,
  toggleBookmark,
  getUserBookmarks,
  sharePost,
  getUserNotifications,
  markNotificationsAsRead,
  incrementPostViews
} from '../controller/postController.js';
import { seedFloodPosts, clearAllPosts } from '../seeds/seedPosts.js';
import { verifyJWT as authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/feed/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

// Public routes
router.get('/posts', getAllPosts);
router.get('/posts/city/:city', getPostsByCity);
router.get('/cities/popular', getPopularCities);

// Protected routes (require authentication)
router.post('/posts/:userId', authMiddleware, upload.array('images', 5), createPost);
router.post('/posts/:postId/like/:userId', authMiddleware, toggleLike);
router.post('/posts/:postId/comments/:userId', authMiddleware, addComment);
router.delete('/posts/:postId/comments/:commentId/:userId', authMiddleware, deleteComment);
router.get('/posts/user/:userId', authMiddleware, getUserPosts);
router.delete('/posts/:postId/:userId', authMiddleware, deletePost);

// Bookmark routes
router.post('/posts/:postId/bookmark/:userId', authMiddleware, toggleBookmark);
router.get('/bookmarks/:userId', authMiddleware, getUserBookmarks);

// Share routes
router.post('/posts/:postId/share/:userId', authMiddleware, sharePost);

// Notification routes
router.get('/notifications/:userId', authMiddleware, getUserNotifications);
router.put('/notifications/:userId/read', authMiddleware, markNotificationsAsRead);

// Analytics routes
router.post('/posts/:postId/view', incrementPostViews);

// Admin seeding routes (for development and testing)
router.post('/admin/seed-flood-posts', async (req, res) => {
  try {
    const result = await seedFloodPosts();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error seeding flood posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed flood posts',
      error: error.message
    });
  }
});

router.delete('/admin/clear-all-posts', async (req, res) => {
  try {
    const result = await clearAllPosts();
    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} posts`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear posts',
      error: error.message
    });
  }
});

export default router;
