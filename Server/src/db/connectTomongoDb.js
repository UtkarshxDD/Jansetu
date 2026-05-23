import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_DB_URL;
        const connectionInstance = await mongoose.connect(uri);
        console.log(`\n✅ MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
}
export default connectDB;