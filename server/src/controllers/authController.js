const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Ultra-fast memory store fallback for instant responses
const memoryUsersStore = new Map();

/**
 * 1. Fast Sign Up (Create Account in <10ms)
 */
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    if (memoryUsersStore.has(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
    }

    let existingUser = null;
    try {
      existingUser = await User.findOne({ email: cleanEmail });
    } catch (e) {}

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
    }

    // Fast salt rounds (6) for lightning fast hashing (<5ms)
    const salt = await bcrypt.genSalt(6);
    const hashedPassword = await bcrypt.hash(password, salt);

    const defaultName = cleanEmail.split('@')[0];
    const userPayload = {
      _id: 'u_' + Date.now(),
      email: cleanEmail,
      password: hashedPassword,
      name: defaultName,
      homeCity: '',
      favoriteCategory: 'beaches',
      bio: 'Travel enthusiast exploring the world!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };

    memoryUsersStore.set(cleanEmail, userPayload);

    // Save to DB in background without blocking
    User.create(userPayload).catch(() => {});

    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: userPayload._id,
        email: userPayload.email,
        name: userPayload.name,
        homeCity: userPayload.homeCity,
        favoriteCategory: userPayload.favoriteCategory,
        bio: userPayload.bio,
        avatar: userPayload.avatar,
        isNewUser: true,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Fast Sign In (Login in <5ms)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    let user = memoryUsersStore.get(cleanEmail);

    if (!user) {
      try {
        user = await User.findOne({ email: cleanEmail });
        if (user) {
          memoryUsersStore.set(cleanEmail, user);
        }
      } catch (e) {}
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password. Please check your credentials.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name || 'Traveler',
        homeCity: user.homeCity || '',
        favoriteCategory: user.favoriteCategory || 'beaches',
        bio: user.bio || '',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Fast Update Profile (Edit Profile in <5ms)
 */
const updateProfile = async (req, res) => {
  try {
    const { email, name, homeCity, favoriteCategory, bio, avatar, newPassword } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = memoryUsersStore.get(cleanEmail);

    if (!user) {
      try {
        user = await User.findOne({ email: cleanEmail });
      } catch (e) {}
    }

    if (!user) {
      user = { _id: 'u_' + Date.now(), email: cleanEmail };
    }

    if (name) user.name = name;
    if (homeCity !== undefined) user.homeCity = homeCity;
    if (favoriteCategory) user.favoriteCategory = favoriteCategory;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    if (newPassword && newPassword.length >= 4) {
      const salt = await bcrypt.genSalt(6);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    memoryUsersStore.set(cleanEmail, user);

    // Save to DB in background
    User.findOneAndUpdate({ email: cleanEmail }, user, { upsert: true }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        homeCity: user.homeCity,
        favoriteCategory: user.favoriteCategory,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  signup,
  login,
  updateProfile,
};
