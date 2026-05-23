import dotenv from "dotenv"
import app from './app.js'
import connectDB from "./db/connectTomongoDb.js"
import { autoSeedIfEmpty } from "./seeds/seedPosts.js"
import { startCronJobs } from "./utils/cronJobs.js"

dotenv.config({
    path:'./env'
})

app.get('/', (req, res)=>{
    res.send("server is running")
})

import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

export { io };

io.on('connection', (socket) => {
  console.log('Client connected for real-time updates:', socket.id);
  socket.on('disconnect', () => {});
});

connectDB()
.then(async ()=>{
  try {
    const seedResult = await autoSeedIfEmpty();
    if (seedResult.success && seedResult.postsCreated > 0) {
      console.log(`🌊 Auto-seeded ${seedResult.postsCreated} flood posts for better user experience`);
    }
  } catch (error) {
    console.log("⚠️  Auto-seeding failed, but server will continue:", error.message);
  }

  // Start background tasks
  startCronJobs();

  const PORT = process.env.PORT || 8000;
  server.listen(PORT, ()=>{
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Feed available at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/feed`);
  })
})
.catch((err) => {
  console.log("MongoDb connection failed", err)
})