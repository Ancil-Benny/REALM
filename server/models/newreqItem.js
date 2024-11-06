const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: String,
    answer: String
  });
  
  const newrequestItemSchema = new mongoose.Schema({
    coltype: String,
    title: String,
    iconName: String,
    category: String,
    questions: [questionSchema],
    verificationQuest: [questionSchema],
    itemId: String,
    userId: String,
    usertype: String
    
  });
  
  const NewrequestItem = mongoose.model('NewrequestItem', newrequestItemSchema);

module.exports = NewrequestItem;