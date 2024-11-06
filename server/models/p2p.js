const mongoose = require('mongoose');
const P2PSchema = new mongoose.Schema({
  itemtitle: {
    type: String,
    required: true,
  },
  ownerUser: {
    type: String,
    required: true,
  },
  ownerUserType: {
    type: String,
    required: true,
  },
  endUser: {
    type: String,
    required: true,
  },
  endUserType: {
    type: String,
    required: true,
  },
  itemId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  messages: [{
    user: String,
    userType: String,
    message: String,
    datetime: Date
  }]
});

module.exports = mongoose.model('P2P', P2PSchema);