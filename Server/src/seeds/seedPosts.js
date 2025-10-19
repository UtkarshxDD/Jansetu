import mongoose from 'mongoose';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './env' });

// Dummy flood posts data
const floodPosts = [
  {
    title: "Severe Flooding in Chennai - Marina Beach Area Submerged",
    content: "Heavy monsoon rains have caused severe flooding across Chennai. Marina Beach road is completely waterlogged. Local authorities are working on drainage systems. Citizens are advised to avoid non-essential travel. #ChennaiFloods #MonsoonAlert",
    city: "chennai",
    coordinates: [80.2707, 13.0827],
    address: "Marina Beach, Chennai, Tamil Nadu",
    tags: ["floods", "monsoon", "emergency", "chennai", "weather"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
        publicId: "chennai_flood_1",
        width: 800,
        height: 600,
        format: "jpg",
        bytes: 125000
      }
    ]
  },
  {
    title: "Mumbai Local Trains Disrupted Due to Waterlogging",
    content: "Western and Central railway lines experiencing major disruptions due to heavy rainfall and waterlogging. Commuters stranded at various stations. BEST buses running on alternate routes. Stay safe Mumbai! 🌧️ #MumbaiRains #LocalTrains",
    city: "mumbai",
    coordinates: [72.8777, 19.0760],
    address: "Dadar Station, Mumbai, Maharashtra",
    tags: ["mumbai", "trains", "waterlogging", "monsoon", "transport"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
        publicId: "mumbai_flood_1",
        width: 800,
        height: 600,
        format: "jpg",
        bytes: 135000
      }
    ]
  },
  {
    title: "Delhi NCR Faces Unprecedented Flooding After Record Rainfall",
    content: "Delhi receives highest rainfall in 24 hours this season. Major roads including Ring Road and ITO flooded. Metro services partially affected. Yamuna river level rising. Government has issued flood advisory for low-lying areas.",
    city: "delhi",
    coordinates: [77.2090, 28.7041],
    address: "ITO, New Delhi, Delhi",
    tags: ["delhi", "floods", "yamuna", "rainfall", "metro"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop",
        publicId: "delhi_flood_1",
        width: 800,
        height: 600,
        format: "jpg",
        bytes: 142000
      }
    ]
  },
  {
    title: "Bangalore IT Corridor Affected by Flash Floods",
    content: "Outer Ring Road and Electronic City experiencing severe waterlogging. Many IT companies have advised work from home. Bellandur Lake overflowing. BMTC buses rerouted. Tech parks providing shelter to stranded employees. #BangaloreFloods",
    city: "bangalore",
    coordinates: [77.5946, 12.9716],
    address: "Electronic City, Bangalore, Karnataka",
    tags: ["bangalore", "floods", "IT", "bellandur", "workfromhome"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        publicId: "bangalore_flood_1",
        width: 800,
        height: 600,
        format: "jpg",
        bytes: 128000
      }
    ]
  },
  {
    title: "Hyderabad Lakes Overflow - Hussain Sagar Area Flooded",
    content: "Continuous rainfall for 48 hours has led to overflowing of Hussain Sagar and other lakes. Tank Bund road closed for traffic. GHMC teams deployed for rescue operations. Citizens near lake areas evacuated to safer locations. 🚨",
    city: "hyderabad",
    coordinates: [78.4867, 17.3850],
    address: "Tank Bund, Hyderabad, Telangana",
    tags: ["hyderabad", "lakes", "hussainsagar", "evacuation", "ghmc"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
        publicId: "hyderabad_flood_1",
        width: 800,
        height: 600,
        format: "jpg",
        bytes: 138000
      }
    ]
  },
  {
    title: "Kolkata Faces Monsoon Fury - Park Street Submerged",
    content: "Heavy downpour in Kolkata has led to waterlogging in major areas including Park Street, Esplanade, and Salt Lake. Metro services running with delays. Trams suspended in several routes. KMC working round the clock for water drainage.",
    city: "kolkata",
    coordinates: [88.3639, 22.5726],
    address: "Park Street, Kolkata, West Bengal",
    tags: ["kolkata", "monsoon", "parkstreet", "metro", "kmc"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&h=600&fit=crop",
        publicId: "kolkata_flood_1",
        width: 800,
        height: 600,
        format: "jpg",
        bytes: 132000
      }
    ]
  },
  {
    title: "Pune Struggles with Urban Flooding - Mula-Mutha Rivers Swell",
    content: "Pune city grapples with urban flooding as Mula and Mutha rivers cross danger levels. Areas like Sinhagad Road, Katraj, and Warje severely affected. PMC has opened relief centers. Residents advised to stay indoors and avoid river areas.",
    city: "pune",
    coordinates: [73.8567, 18.5204],
    address: "Sinhagad Road, Pune, Maharashtra",
    tags: ["pune", "rivers", "urbanflooding", "pmc", "relief"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1574482620881-b3d4cf6c1b8d?w=800&h=600&fit=crop",
        publicId: "pune_flood_1",
        width: 800,
        height: 600,
        format: "jpg",
        bytes: 145000
      }
    ]
  },
  {
    title: "Ahmedabad Witnesses Unprecedented Rainfall and Flooding",
    content: "Ahmedabad records highest single-day rainfall in decades. Sabarmati riverfront area flooded. BRTS services disrupted. AMC emergency teams deployed across the city. Several underpasses waterlogged. Citizens sharing boats and helping each other! 🤝",
    city: "ahmedabad",
    coordinates: [72.5714, 23.0225],
    address: "Sabarmati Riverfront, Ahmedabad, Gujarat",
    tags: ["ahmedabad", "sabarmati", "brts", "amc", "community"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1562841791-6a3c2f0c5b7d?w=800&h=600&fit=crop",
        publicId: "ahmedabad_flood_1",
        width: 800,
        height: 600,
        format: "jpg",
        bytes: 140000
      }
    ]
  }
];

// Create default admin user for posts
const createDefaultUser = async () => {
  try {
    let defaultUser = await User.findOne({ email: 'system@jansetu.com' });
    
    if (!defaultUser) {
      defaultUser = new User({
        name: 'Janhit News Team',
        email: 'system@jansetu.com',
        password: 'systemuser123', // This would be hashed in real implementation
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.7041] // Delhi coordinates
        },
        address: 'New Delhi, India'
      });
      await defaultUser.save();
      console.log('✅ Default system user created');
    }
    
    return defaultUser;
  } catch (error) {
    console.error('❌ Error creating default user:', error);
    throw error;
  }
};

// Seed flood posts
export const seedFloodPosts = async () => {
  try {
    console.log('🌊 Starting flood posts seeding...');

    // Check if posts already exist
    const existingPostsCount = await Post.countDocuments({ isActive: true });
    
    if (existingPostsCount > 0) {
      console.log(`📊 Found ${existingPostsCount} existing posts. Skipping seeding.`);
      return {
        success: true,
        message: `${existingPostsCount} posts already exist`,
        postsCreated: 0
      };
    }

    // Create default user
    const defaultUser = await createDefaultUser();

    // Create flood posts
    const createdPosts = [];
    
    for (const postData of floodPosts) {
      try {
        // Add some randomness to creation dates (last 7 days)
        const randomDaysAgo = Math.floor(Math.random() * 7);
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - randomDaysAgo);
        createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 24));

        const post = new Post({
          title: postData.title,
          content: postData.content,
          city: postData.city,
          location: {
            type: 'Point',
            coordinates: postData.coordinates
          },
          address: postData.address,
          author: defaultUser._id,
          tags: postData.tags,
          images: postData.images,
          createdAt: createdAt,
          updatedAt: createdAt,
          // Add some random engagement to make it look realistic
          likesCount: Math.floor(Math.random() * 50) + 10,
          commentsCount: Math.floor(Math.random() * 20) + 2,
          sharesCount: Math.floor(Math.random() * 15) + 1,
          viewsCount: Math.floor(Math.random() * 200) + 50
        });

        // Add some random likes
        const likeCount = post.likesCount;
        for (let i = 0; i < likeCount; i++) {
          post.likes.push({
            user: defaultUser._id,
            createdAt: new Date(createdAt.getTime() + Math.random() * 86400000) // Random time after post creation
          });
        }

        // Add some sample comments
        const sampleComments = [
          "Stay safe everyone! 🙏",
          "Thanks for the update. Very helpful information.",
          "Situation is really bad in our area too.",
          "Government should take immediate action.",
          "Hope everyone is safe. Let's help each other.",
          "Great initiative to keep everyone informed!",
          "Please share emergency contact numbers.",
          "Avoid traveling unless absolutely necessary."
        ];

        const commentCount = Math.min(post.commentsCount, 5); // Limit to 5 comments max
        for (let i = 0; i < commentCount; i++) {
          post.comments.push({
            user: defaultUser._id,
            content: sampleComments[Math.floor(Math.random() * sampleComments.length)],
            createdAt: new Date(createdAt.getTime() + Math.random() * 86400000)
          });
        }

        await post.save();
        createdPosts.push(post);
        
        console.log(`✅ Created post: "${postData.title}" for ${postData.city}`);
        
      } catch (error) {
        console.error(`❌ Error creating post for ${postData.city}:`, error.message);
      }
    }

    console.log(`🎉 Successfully created ${createdPosts.length} flood posts!`);
    
    return {
      success: true,
      message: `${createdPosts.length} flood posts created successfully`,
      postsCreated: createdPosts.length,
      posts: createdPosts
    };

  } catch (error) {
    console.error('❌ Error seeding flood posts:', error);
    throw error;
  }
};

// Function to clear all posts (for testing)
export const clearAllPosts = async () => {
  try {
    const result = await Post.deleteMany({});
    await User.deleteMany({ email: 'system@jansetu.com' });
    console.log(`🗑️ Cleared ${result.deletedCount} posts and system user`);
    return result;
  } catch (error) {
    console.error('❌ Error clearing posts:', error);
    throw error;
  }
};

// Auto-seed function that can be called from the main app
export const autoSeedIfEmpty = async () => {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const result = await seedFloodPosts();
    return result;
  } catch (error) {
    console.error('❌ Auto-seed failed:', error);
    return {
      success: false,
      message: error.message,
      postsCreated: 0
    };
  }
};

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected for seeding');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  };

  const main = async () => {
    await connectDB();
    
    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--clear')) {
      await clearAllPosts();
    } else {
      await seedFloodPosts();
    }
    
    console.log('✨ Seeding completed!');
    process.exit(0);
  };

  main().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}
