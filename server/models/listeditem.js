const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: String,
    answer: String
  });
  
  const listedItemSchema = new mongoose.Schema({
    coltype:String,
    title: String,
    iconName: String,
    category: String,
    questions: [questionSchema],
    verificationQuest: [questionSchema],
    itemId: String,
    userId: String,
    usertype: String
    
  });
  
  const ListedItem = mongoose.model('ListedItem', listedItemSchema);

module.exports = ListedItem;