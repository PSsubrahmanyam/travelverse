const mongoose = require('mongoose');

/**
 * Mongoose User Schema for Email + Password Auth and Traveler Profiles
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    name: {
      type: String,
      trim: true,
      default: 'Traveler',
    },
    homeCity: {
      type: String,
      trim: true,
      default: '',
    },
    favoriteCategory: {
      type: String,
      default: 'beaches',
    },
    bio: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
