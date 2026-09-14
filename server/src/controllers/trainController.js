const {
  POPULAR_STATIONS,
  POPULAR_TRAINS,
  findTrainsBetweenStations,
  getLiveTrainStatus,
  getLiveStationBoard,
  getPNRStatus,
} = require('../../../client/src/data/railwaysData');

// @desc    Get all Indian Railway stations
// @route   GET /api/trains/stations
const getStations = async (req, res) => {
  try {
    const { search } = req.query;
    let stations = POPULAR_STATIONS;

    if (search) {
      const q = search.toLowerCase().trim();
      stations = stations.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: stations.length,
      data: stations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search trains between two stations
// @route   GET /api/trains/between-stations
const getTrainsBetweenStations = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both "from" and "to" station codes or names.',
      });
    }

    const trains = findTrainsBetweenStations(from, to);

    res.status(200).json({
      success: true,
      count: trains.length,
      from,
      to,
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

// @desc    Get PNR Status Simulation
// @route   GET /api/trains/pnr/:pnrNumber
const checkPNR = async (req, res) => {
  try {
    const { pnrNumber } = req.params;
    const pnrData = getPNRStatus(pnrNumber);

    res.status(200).json({
      success: true,
      data: pnrData,
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
  checkPNR,
};
