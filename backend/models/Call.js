const mongoose = require('mongoose');

const callSchema = new mongoose.Schema(
  {
    caller: { type: String, required: true, trim: true },
    receiver: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['initiated', 'accepted', 'rejected', 'ended'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Call', callSchema);