import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './src/models/postModel.js';
import User from './src/models/userModel.js';
import Notification from './src/models/notificationModel.js';
import Bookmark from './src/models/bookmarkModel.js';

// Load environment variables
dotenv.config({ path: './env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Test database operations
const testDatabaseOperations = async () => {
  try {
    console.log('\n🧪 Testing Feed Database Operations...\n');

    // Test 1: Check if collections exist
    console.log('1. Checking collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log('   Available collections:', collectionNames);
    console.log('   ✅ Collections check completed\n');

    // Test 2: Create a test user if not exists
    console.log('2. Creating test user...');
    let testUser = await User.findOne({ email: 'test@jansetu.com' });
    
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'test@jansetu.com',
        password: 'hashedpassword123',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.7041] // Delhi coordinates
        },
        address: 'New Delhi, India'
      });
      await testUser.save();
      console.log('   ✅ Test user created');
    } else {
      console.log('   ✅ Test user already exists');
    }

    // Test 3: Create a test post
    console.log('\n3. Creating test post...');
    const testPost = new Post({
      title: 'Test Community Post',
      content: 'This is a test post to verify database integration with @TestUser mention',
      city: 'delhi',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.7041]
      },
      address: 'Connaught Place, New Delhi',
      author: testUser._id,
      tags: ['test', 'community', 'database'],
      mentions: [testUser._id],
      images: [{
        url: 'https://via.placeholder.com/800x600',
        publicId: 'test_image_123',
        width: 800,
        height: 600,
        format: 'jpg',
        bytes: 102400
      }]
    });

    await testPost.save();
    console.log('   ✅ Test post created with ID:', testPost._id);

    // Test 4: Test like functionality
    console.log('\n4. Testing like functionality...');
    testPost.likes.push({ user: testUser._id });
    testPost.likesCount += 1;
    await testPost.save();
    console.log('   ✅ Like added successfully');

    // Test 5: Test comment functionality
    console.log('\n5. Testing comment functionality...');
    testPost.comments.push({
      user: testUser._id,
      content: 'This is a test comment',
      createdAt: new Date()
    });
    testPost.commentsCount += 1;
    await testPost.save();
    console.log('   ✅ Comment added successfully');

    // Test 6: Test bookmark functionality
    console.log('\n6. Testing bookmark functionality...');
    const bookmark = new Bookmark({
      user: testUser._id,
      post: testPost._id
    });
    await bookmark.save();
    console.log('   ✅ Bookmark created successfully');

    // Test 7: Test notification functionality
    console.log('\n7. Testing notification functionality...');
    const notification = new Notification({
      recipient: testUser._id,
      sender: testUser._id,
      type: 'like',
      message: 'Test User liked your post',
      post: testPost._id
    });
    await notification.save();
    console.log('   ✅ Notification created successfully');

    // Test 8: Test share functionality
    console.log('\n8. Testing share functionality...');
    testPost.shares.push({ user: testUser._id });
    testPost.sharesCount += 1;
    await testPost.save();
    console.log('   ✅ Share added successfully');

    // Test 9: Test aggregation queries
    console.log('\n9. Testing aggregation queries...');
    
    // Popular cities
    const popularCities = await Post.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$city', 
          count: { $sum: 1 },
          latestPost: { $max: '$createdAt' }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    console.log('   Popular cities:', popularCities);

    // Test 10: Test geospatial queries
    console.log('\n10. Testing geospatial queries...');
    const nearbyPosts = await Post.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [77.2090, 28.7041] // Delhi
          },
          $maxDistance: 10000 // 10km
        }
      },
      isActive: true
    }).limit(5);
    console.log('   Nearby posts found:', nearbyPosts.length);

    // Test 11: Test text search
    console.log('\n11. Testing text search...');
    const searchResults = await Post.find({
      $text: { $search: 'test community' },
      isActive: true
    }).limit(5);
    console.log('   Search results found:', searchResults.length);

    // Test 12: Verify data integrity
    console.log('\n12. Verifying data integrity...');
    const postWithPopulatedData = await Post.findById(testPost._id)
      .populate('author', 'name email')
      .populate('mentions', 'name email')
      .populate('comments.user', 'name');
    
    console.log('   Post author:', postWithPopulatedData.author.name);
    console.log('   Post mentions:', postWithPopulatedData.mentions.length);
    console.log('   Post comments:', postWithPopulatedData.comments.length);
    console.log('   Post likes:', postWithPopulatedData.likesCount);
    console.log('   Post shares:', postWithPopulatedData.sharesCount);
    console.log('   Post images:', postWithPopulatedData.images.length);

    console.log('\n🎉 All database tests passed successfully!');
    console.log('\n📊 Database Statistics:');
    console.log('   - Posts:', await Post.countDocuments());
    console.log('   - Users:', await User.countDocuments());
    console.log('   - Bookmarks:', await Bookmark.countDocuments());
    console.log('   - Notifications:', await Notification.countDocuments());

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
};

// Cleanup function
const cleanup = async () => {
  try {
    console.log('\n🧹 Cleaning up test data...');
    
    // Remove test data
    await Post.deleteMany({ title: 'Test Community Post' });
    await User.deleteMany({ email: 'test@jansetu.com' });
    await Bookmark.deleteMany({});
    await Notification.deleteMany({ message: 'Test User liked your post' });
    
    console.log('   ✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await testDatabaseOperations();
  
  // Ask user if they want to cleanup
  console.log('\n❓ Do you want to clean up test data? (y/n)');
  
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', async () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      const input = chunk.trim().toLowerCase();
      if (input === 'y' || input === 'yes') {
        await cleanup();
      }
      console.log('\n✨ Test completed!');
      process.exit(0);
    }
  });
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Process interrupted. Cleaning up...');
  await cleanup();
  process.exit(0);
});

// Run the test
main().catch(console.error);
