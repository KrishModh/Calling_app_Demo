const twilio = require('twilio');
const { createTwilioToken } = require('../utils/twilio');
const Call = require('../models/Call');

function getToken(req, res) {
  try {
    const identity = req.user.email;
    const token = createTwilioToken(identity);
    const peers = [process.env.USER1_EMAIL, process.env.USER2_EMAIL].filter(
      (email) => email && email !== identity
    );

    return res.json({ token, identity, peers });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to generate Twilio token' });
  }
}

async function logCall(req, res) {
  const { caller, receiver, status } = req.body;

  if (!caller || !receiver || !status) {
    return res.status(400).json({ message: 'caller, receiver, and status are required' });
  }

  if (typeof Call.db?.readyState !== 'number' || Call.db.readyState !== 1) {
    return res.status(200).json({ message: 'MongoDB not connected. Call log skipped.' });
  }

  try {
    await Call.create({ caller, receiver, status });
    return res.status(201).json({ message: 'Call log saved' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save call log' });
  }
}

function voiceWebhook(req, res) {
  const receiver = req.body.receiver || req.query.receiver || req.body.To || req.query.To;
  const response = new twilio.twiml.VoiceResponse();

  if (!receiver) {
    response.say('No receiver identity was provided.');
  } else {
    const dial = response.dial({ callerId: process.env.TWILIO_PHONE_NUMBER });
    dial.client(receiver);
  }

  res.type('text/xml');
  return res.send(response.toString());
}

module.exports = { getToken, logCall, voiceWebhook };
