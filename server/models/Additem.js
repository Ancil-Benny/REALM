const mongoose = require('mongoose');

const AddItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  questions: {
    type: [String],
    required: true
  },
  verificationQuest: {
    type: [String],
    required: true
  }
});

const AddItem = mongoose.model('AddItem', AddItemSchema);

module.exports = AddItem;