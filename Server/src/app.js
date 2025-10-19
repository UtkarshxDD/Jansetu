import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();



// CORS configuration for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:5173",  // Default Vite port
      "http://localhost:3000",  // Common React port
      "http://localhost:4173",  // Vite preview port
      "http://127.0.0.1:5173",  // Alternative localhost
      "http://127.0.0.1:3000",  // Alternative localhost
      process.env.CORS || "http://localhost:5173"
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cookieParser());

// Serve uploads directory for media files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

import userRouter from "./routes/userRoute.js"
import adminRouter from "./routes/adminRoute.js"
import feedRouter from "./routes/feedRoute.js"
import campaignRouter from "./routes/campaignRoute.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/feed", feedRouter);
app.use("/api/v1/campaign", campaignRouter);

export default app;