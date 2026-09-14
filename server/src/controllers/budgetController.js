const BudgetPlan = require('../models/BudgetPlan');

/**
 * Calculate total trip budget and save estimation to DB
 */
const calculateBudget = async (req, res) => {
  try {
    const { 
      fromPlace = 'Mumbai, Maharashtra',
      toPlace = 'Goa, India',
      destinationName,
      transitMode = 'train',
      estimatedDistanceKm = 500,
      durationDays = 1, 
      travelersCount = 1, 
      travelCost = 0, 
      stayCost = 0, 
      foodCost = 0, 
      miscCost = 0, 
      totalBudget 
    } = req.body;

    const days = Number(durationDays) || 1;
    const travelers = Number(travelersCount) || 1;
    const travel = Number(travelCost) || 0;
    const stay = Number(stayCost) || 0;
    const food = Number(foodCost) || 0;
    const misc = Number(miscCost) || 0;

    const calculatedTotal = totalBudget || (travel + stay + food + misc);
    const destTitle = destinationName || toPlace || 'General Trip';

    let savedPlan = null;
    try {
      savedPlan = await BudgetPlan.create({
        fromPlace,
        toPlace: destTitle,
        destinationName: destTitle,
        transitMode,
        estimatedDistanceKm: Number(estimatedDistanceKm) || 500,
        durationDays: days,
        travelersCount: travelers,
        travelCost: travel,
        stayCost: stay,
        foodCost: food,
        miscCost: misc,
        totalBudget: calculatedTotal,
      });
    } catch (e) {
      // Fallback response if DB offline
    }

    return res.status(200).json({
      success: true,
      data: {
        fromPlace,
        toPlace: destTitle,
        destinationName: destTitle,
        transitMode,
        estimatedDistanceKm: Number(estimatedDistanceKm) || 500,
        durationDays: days,
        travelersCount: travelers,
        breakdown: {
          travelCost: travel,
          stayCost: stay,
          foodCost: food,
          miscCost: misc,
        },
        totalBudget: calculatedTotal,
        savedId: savedPlan ? savedPlan._id : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  calculateBudget,
};
