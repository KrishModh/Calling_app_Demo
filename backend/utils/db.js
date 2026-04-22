const mongoose = require('mongoose');

async function connectMongo() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('MONGO_URI not set. Running without MongoDB call logs.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed. Continuing without DB.', error.message);
  }
}

module.exports = connectMongo;