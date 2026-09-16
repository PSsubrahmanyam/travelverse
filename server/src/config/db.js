const mongoose = require('mongoose');

let isConnected = false;

/**
 * Serverless-safe MongoDB connection helper.
 * Reuses active connection across lambda invocations and avoids blocking cold starts.
 */
const connectDB = async () => {
  if (isConnected) return;
  
  if (!process.env.MONGO_URI) {
    console.log('[Database] No MONGO_URI configured. Running in memory fallback mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = conn.connections[0].readyState === 1;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
  }
};

module.exports = connectDB;
