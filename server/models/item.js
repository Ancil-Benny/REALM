const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  color: {
    type: String
  },
  brand: {
    type: String
  },
  details: {
    type: String
  },
  location: {
    type: String
  },
  person: {
    type: String,
    default: 'Unknown'
  },
  person_id: {
    type: Number,
    default: -1
  },
  snapshot_id: {
    type: Number
  },
  image_path: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', ItemSchema, 'auto-vision');