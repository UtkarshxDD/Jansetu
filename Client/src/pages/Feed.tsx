import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Search, 
  Plus,
  X,
  Camera,
  Send,
  MoreHorizontal,
  Bookmark,
  Bell,
  Eye
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FEED_API } from '../ApiUri';
import FeedHero from '../components/FeedHero';

const API = FEED_API;

interface Post {
  _id: string;
  title: string;
  content: string;
  images: Array<{
    url: string;
    publicId: string;
  }>;
  city: string;
  address: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  likes: Array<{
    user: string;
    createdAt: string;
  }>;
  likesCount: number;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      name: string;
    };
    content: string;
    createdAt: string;
  }>;
  commentsCount: number;
  shares: Array<{
    user: string;
    createdAt: string;
  }>;
  sharesCount: number;
  mentions: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  tags: string[];
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface City {
  city: string;
  postCount: number;
  latestPost: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Create post form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    city: '',
    coordinates: [0, 0],
    address: '',
    tags: '',
    images: [] as File[]
  });

  // Comment states
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});

  // Bookmark and notification states
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('id');
    setCurrentUser(userId);
    fetchPosts();
    fetchPopularCities();
    getCurrentLocation();
    if (userId) {
      fetchNotifications();
    }
  }, [currentPage, selectedCity, searchQuery]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewPost(prev => ({
            ...prev,
            coordinates: [position.coords.longitude, position.coords.latitude]
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (selectedCity) params.append('city', selectedCity);
      if (searchQuery) params.append('search', searchQuery);

      const response = await axios.get(`${API}/posts?${params}`);
      
      if (response.data.success) {
        setPosts(response.data.posts);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularCities = async () => {
    try {
      const response = await axios.get(`${API}/cities/popular`);
      if (response.data.success) {
        setPopularCities(response.data.cities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login to create a post');
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.city.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      formData.append('city', newPost.city);
      formData.append('coordinates', JSON.stringify(newPost.coordinates));
      formData.append('address', newPost.address);
      formData.append('tags', JSON.stringify(newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)));

      newPost.images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await axios.post(`${API}/posts/${currentUser}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('Post created successfully!');
        setShowCreatePost(false);
        setNewPost({
          title: '',
          content: '',
          city: '',
          coordinates: [0, 0],
          address: '',
          tags: '',
          images: []
        });
        fetchPosts();
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await axios.post(`${API}/posts/${postId}/like/${currentUser}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { 
                  ...post, 
                  likesCount: response.data.likesCount,
                  likes: response.data.isLiked 
                    ? [...post.likes, { user: currentUser, createdAt: new Date().toISOString() }]
                    : post.likes.filter(like => like.user !== currentUser)
                }
              : post
          )
        );
      }
    } catch (error: any) {
      console.error('Error liking post:', error);
      toast.error(error.response?.data?.message || 'Failed to like post');
    }
  };

  const handleComment = async (postId: string) => {
    if (!currentUser) {
      toast.error('Please login to comment');
      return;
    }

    const content = commentInputs[postId]?.trim();
    if (!content) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const response = await axios.post(`${API}/posts/${postId}/comments/${currentUser}`, 
        { content }, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { 
                  ...post, 
                  comments: [...post.comments, response.data.comment],
                  commentsCount: response.data.commentsCount
                }
              : post
          )
        );
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        toast.success('Comment added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setNewPost(prev => ({ ...prev, images: files }));
  };

  const removeImage = (index: number) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const isLikedByUser = (post: Post) => {
    return post.likes.some(like => like.user === currentUser);
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    try {
      const response = await axios.get(`${API}/notifications/${currentUser}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!currentUser) {
      toast.error('Please login to bookmark posts');
      return;
    }

    try {
      const response = await axios.post(`${API}/posts/${postId}/bookmark/${currentUser}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const newBookmarkedPosts = new Set(bookmarkedPosts);
        if (response.data.isBookmarked) {
          newBookmarkedPosts.add(postId);
          toast.success('Post bookmarked!');
        } else {
          newBookmarkedPosts.delete(postId);
          toast.success('Bookmark removed!');
        }
        setBookmarkedPosts(newBookmarkedPosts);
      }
    } catch (error: any) {
      console.error('Error bookmarking post:', error);
      toast.error(error.response?.data?.message || 'Failed to bookmark post');
    }
  };

  const handleShare = async (postId: string) => {
    if (!currentUser) {
      toast.error('Please login to share posts');
      return;
    }

    try {
      const response = await axios.post(`${API}/posts/${postId}/share/${currentUser}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, sharesCount: response.data.sharesCount }
              : post
          )
        );
        toast.success('Post shared successfully!');
        
        // Copy link to clipboard
        const postUrl = `${window.location.origin}/feed?post=${postId}`;
        navigator.clipboard.writeText(postUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error: any) {
      console.error('Error sharing post:', error);
      toast.error(error.response?.data?.message || 'Failed to share post');
    }
  };

  const markNotificationsAsRead = async () => {
    if (!currentUser) return;

    try {
      await axios.put(`${API}/notifications/${currentUser}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setUnreadCount(0);
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const incrementPostViews = async (postId: string) => {
    try {
      await axios.post(`${API}/posts/${postId}/view`);
    } catch (error) {
      console.error('Error incrementing post views:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Feed</h1>
              <p className="text-gray-600 mt-1">Share and discover what's happening in your city</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications && unreadCount > 0) {
                        markNotificationsAsRead();
                      }
                    }}
                    className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.slice(0, 10).map((notification) => (
                            <div
                              key={notification._id}
                              className={`p-4 hover:bg-gray-50 ${
                                !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                            >
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setShowCreatePost(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Post
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {popularCities.map((city) => (
                <option key={city.city} value={city.city}>
                  {city.city.charAt(0).toUpperCase() + city.city.slice(1)} ({city.postCount})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <>
            <FeedHero />
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🌊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Community Feed!</h3>
              <p className="text-gray-600 mb-4">
                {selectedCity 
                  ? `No posts found for ${selectedCity}. Try searching in other cities or create the first post for your area!`
                  : searchQuery 
                    ? `No posts found for "${searchQuery}". Try different keywords or create a new post!`
                    : "The feed is loading with recent updates from cities across India. Create your first post to get started!"
                }
              </p>
              {currentUser && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Post
                </button>
              )}
              {!currentUser && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl max-w-md mx-auto">
                  <p className="text-blue-800 text-sm">
                    <strong>💡 Tip:</strong> Login to create posts, like, comment, and engage with your community!
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                onViewportEnter={() => incrementPostViews(post._id)}
              >
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {post.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.author?.name || 'Unknown User'}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {post.city.charAt(0).toUpperCase() + post.city.slice(1)}
                          <span className="mx-2">•</span>
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-gray-700 leading-relaxed">{post.content}</p>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Images */}
                {post.images.length > 0 && (
                  <div className="px-6 pb-4">
                    <div className={`grid gap-2 ${
                      post.images.length === 1 ? 'grid-cols-1' :
                      post.images.length === 2 ? 'grid-cols-2' :
                      'grid-cols-2 md:grid-cols-3'
                    }`}>
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`Post image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-xl"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Actions */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          isLikedByUser(post)
                            ? 'text-red-600'
                            : 'text-gray-600 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isLikedByUser(post) ? 'fill-current' : ''}`} />
                        <span className="font-medium">{post.likesCount}</span>
                      </button>
                      
                      <button
                        onClick={() => setShowComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">{post.commentsCount}</span>
                      </button>
                      
                      <button
                        onClick={() => handleShare(post._id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                        <span className="font-medium">{post.sharesCount || 0}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleBookmark(post._id)}
                        className={`p-2 rounded-full transition-colors ${
                          bookmarkedPosts.has(post._id)
                            ? 'text-yellow-600 bg-yellow-100'
                            : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${bookmarkedPosts.has(post._id) ? 'fill-current' : ''}`} />
                      </button>
                      
                      <div className="flex items-center space-x-1 text-gray-500 text-sm">
                        <Eye className="w-4 h-4" />
                        <span>{post.viewsCount || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[post._id] && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {/* Add Comment */}
                      {currentUser && (
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">You</span>
                          </div>
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentInputs[post._id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                            />
                            <button
                              onClick={() => handleComment(post._id)}
                              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Comments List */}
                      <div className="space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment._id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-semibold text-sm">
                                {comment.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                                <p className="font-semibold text-sm text-gray-900">{comment.user.name}</p>
                                <p className="text-gray-700">{comment.content}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 ml-4">
                                {formatDate(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's your post about?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your thoughts..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={newPost.city}
                    onChange={(e) => setNewPost(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newPost.address}
                    onChange={(e) => setNewPost(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Specific location (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas (e.g., community, events, news)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images (Max 5)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click to upload images</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                  </label>
                </div>

                {/* Image Previews */}
                {newPost.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {newPost.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Create Post
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Feed;
