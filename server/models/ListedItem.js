const mongoose = require('mongoose');

const ListedItemSchema = new mongoose.Schema({
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
}, { collection: 'listeditems' }); 

module.exports = mongoose.model('ListedItem', ListedItemSchema);