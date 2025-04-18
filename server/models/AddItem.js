const mongoose = require('mongoose');

const AddItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  questions: {
    type: [String],
    required: true
  },
  verificationQuest: {
    type: [String],
    required: true
  }
}, { collection: 'additems' }); 

module.exports = mongoose.model('AddItem', AddItemSchema);