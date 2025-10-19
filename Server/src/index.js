import dotenv from "dotenv"
import app from './app.js'
import connectDB from "./db/connectTomongoDb.js"
import { autoSeedIfEmpty } from "./seeds/seedPosts.js"
import vwoService from './services/vwoService.js'

dotenv.config({
    path:'./env'
})

app.get('/', (req, res)=>{
    res.send("server is running")
})

connectDB()
.then(async ()=>{
  // Initialize VWO SDK
  try {
    await vwoService.initialize();
    console.log('🎯 VWO Feature Experimentation initialized');
  } catch (error) {
    console.log("⚠️  VWO initialization failed, but server will continue:", error.message);
  }

  // Auto-seed flood posts if database is empty
  try {
    const seedResult = await autoSeedIfEmpty();
    if (seedResult.success && seedResult.postsCreated > 0) {
      console.log(`🌊 Auto-seeded ${seedResult.postsCreated} flood posts for better user experience`);
    }
  } catch (error) {
    console.log("⚠️  Auto-seeding failed, but server will continue:", error.message);
  }

  const PORT = process.env.PORT || 8000;
  app.listen(PORT, ()=>{
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Feed available at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/feed`);
  })
})
.catch((err) => {
  console.log("MongoDb connection failed", err)
})