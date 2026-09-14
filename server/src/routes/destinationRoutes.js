const express = require('express');
const router = express.Router();
const { getDestinations, createDestination } = require('../controllers/destinationController');

router.get('/', getDestinations);
router.post('/', createDestination);

module.exports = router;
