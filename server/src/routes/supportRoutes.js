const express = require('express');
const router = express.Router();
const { submitSupportTicket } = require('../controllers/supportController');

router.post('/contact', submitSupportTicket);

module.exports = router;
