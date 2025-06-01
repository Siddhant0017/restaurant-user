const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  },
  visits: {
    type: Number,
    default: 1
  },
  lastVisit: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Client', ClientSchema);