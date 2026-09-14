const mongoose = require('mongoose');

/**
 * Mongoose Schema for Saved Travel Budget Estimations
 */
const budgetPlanSchema = new mongoose.Schema(
  {
    fromPlace: {
      type: String,
      default: 'Mumbai, Maharashtra',
    },
    toPlace: {
      type: String,
      default: 'Goa & Konkan Coast',
    },
    destinationName: {
      type: String,
      default: 'General Trip',
    },
    transitMode: {
      type: String,
      default: 'train',
    },
    estimatedDistanceKm: {
      type: Number,
      default: 500,
    },
    durationDays: {
      type: Number,
      required: true,
      default: 1,
    },
    travelersCount: {
      type: Number,
      default: 1,
    },
    travelCost: {
      type: Number,
      required: true,
      default: 0,
    },
    stayCost: {
      type: Number,
      required: true,
      default: 0,
    },
    foodCost: {
      type: Number,
      required: true,
      default: 0,
    },
    miscCost: {
      type: Number,
      required: true,
      default: 0,
    },
    totalBudget: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BudgetPlan', budgetPlanSchema);
