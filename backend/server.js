require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectMongo = require('./utils/db');
const authRoutes = require('./routes/authRoutes');
const voiceRoutes = require('./routes/voiceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/voice', voiceRoutes);

connectMongo().finally(() => {
  app.listen(PORT, () => {
    console.log(`Backend is running`);
  });
});