const { string } = require('joi');
const mongoose = require('mongoose');

const ClaimListSchema = new mongoose.Schema({
    userId: {
    type: String,
    required: true,
  },
  usertype: {
    type: String,
    required: true,
  },
  itemId: {
    type: String,
    required: true,
  },
  chances: {
    type: Number,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  similarityPercentage: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('ClaimList', ClaimListSchema);