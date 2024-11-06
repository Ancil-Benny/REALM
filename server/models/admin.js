const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  admid: {
    type: String,
    required: true,
    unique: true
  },
  admname: {
    type: String,
  },
  admemail: {
    type: String,
    required: true,
    unique: true
  },
  admpassword: {
    type: String,
    required: true
  }  
});

const admin = mongoose.model('admin', AdminSchema);

module.exports = admin;