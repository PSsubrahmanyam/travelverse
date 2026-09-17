const {
  findTrainsBetweenStations,
  searchStations,
  getLiveStationBoard,
  getLiveTrainStatus,
} = require('../services/railwaySearchService');

// @desc    Get Indian Railway stations autocomplete
// @route   GET /api/trains/stations
const getStations = async (req, res) => {
  try {
    const { search } = req.query;
    const stations = searchStations(search || '');

    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search trains between stations or by train number/name
// @route   GET /api/trains/between-stations
const getTrainsBetweenStations = async (req, res) => {
  try {
    const { from, to, query } = req.query;
    const trains = findTrainsBetweenStations(from || '', to || '', query || '');

    res.status(200).json({
      success: true,
      count: trains.length,
      from: from || '',
      to: to || '',
      data: trains,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Live Spot Train Status
// @route   GET /api/trains/live-status/:trainNumber
const getLiveStatus = async (req, res) => {
  try {
    const { trainNumber } = req.params;
    const status = getLiveTrainStatus(trainNumber);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Live Station Arrivals & Departures Board
// @route   GET /api/trains/station-board/:stationCode
const getStationBoard = async (req, res) => {
  try {
    const { stationCode } = req.params;
    const board = getLiveStationBoard(stationCode);

    res.status(200).json({
      success: true,
      data: board,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStations,
  getTrainsBetweenStations,
  getLiveStatus,
  getStationBoard,
};
