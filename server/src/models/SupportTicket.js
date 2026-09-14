const mongoose = require('mongoose');

/**
 * Mongoose Schema for Traveler Support Tickets
 */
const supportTicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    supportType: {
      type: String,
      default: 'General Query',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'emailed', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
