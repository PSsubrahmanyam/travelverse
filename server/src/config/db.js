const mongoose = require('mongoose');

/**
 * Connect to MongoDB database using Mongoose.
 * Supports MongoDB Atlas (free tier) or local MongoDB instance.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anti-travel');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // Optional fallback mode so server still starts even without active DB for demo
    console.log('[Database Warning] Continuing in fallback mode without active DB connection...');
  }
};

module.exports = connectDB;
