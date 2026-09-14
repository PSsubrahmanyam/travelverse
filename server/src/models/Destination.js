const mongoose = require('mongoose');

/**
 * Mongoose Schema for Tourist Destination Places (6 Famous Categories)
 */
const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Destination title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['beaches', 'temples', 'hills', 'historical', 'wildlife', 'waterfalls'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    locationName: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    avgCostPerDay: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Destination', destinationSchema);
