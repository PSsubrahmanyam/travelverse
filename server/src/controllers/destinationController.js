const Destination = require('../models/Destination');
const SAMPLE_DESTINATIONS = require('../data/destinationsData');

/**
 * Get all tourist destinations (supports category filter & pagination/all 500 places)
 */
const getDestinations = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Try fetching from DB if connected
    let destinations = [];
    try {
      destinations = await Destination.find(filter);
    } catch (e) {
      // Fallback if DB not ready
    }

    if (!destinations || destinations.length === 0) {
      destinations = category && category !== 'all'
        ? SAMPLE_DESTINATIONS.filter((item) => item.category === category)
        : SAMPLE_DESTINATIONS;
    }

    return res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add a new destination
 */
const createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    return res.status(201).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDestinations,
  createDestination,
};
