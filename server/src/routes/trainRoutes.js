const express = require('express');
const router = express.Router();
const {
  getStations,
  getTrainsBetweenStations,
  getLiveStatus,
  getStationBoard,
  checkPNR,
} = require('../controllers/trainController');

router.get('/stations', getStations);
router.get('/between-stations', getTrainsBetweenStations);
router.get('/live-status/:trainNumber', getLiveStatus);
router.get('/station-board/:stationCode', getStationBoard);
router.get('/pnr/:pnrNumber', checkPNR);

module.exports = router;
