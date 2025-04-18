const mongoose = require('mongoose');

const RequestedItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  iconName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  questions: [{
    question: String,
    answer: String
  }],
  verificationQuest: [{
    question: String,
    answer: String
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'reqitems' });  

module.exports = mongoose.model('RequestedItem', RequestedItemSchema);