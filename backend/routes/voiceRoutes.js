const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getToken, logCall, voiceWebhook } = require('../controllers/voiceController');

const router = express.Router();

router.get('/token', authMiddleware, getToken);
router.post('/calls/log', authMiddleware, logCall);
router.post('/twiml/voice', voiceWebhook);
router.get('/twiml/voice', voiceWebhook);

module.exports = router;