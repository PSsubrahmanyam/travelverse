const mongoose = require('mongoose');

/**
 * Connect to MongoDB database using Mongoose.
 * Supports MongoDB Atlas (free tier) or local MongoDB instance.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI && process.env.VERCEL) {
      console.log('[Database] No MONGO_URI provided in Vercel environment. Operating in memory fallback mode.');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anti-travel', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    console.log('[Database Warning] Continuing in fallback mode without active DB connection...');
  }
};

module.exports = connectDB;
