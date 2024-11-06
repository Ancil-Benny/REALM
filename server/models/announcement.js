// models/announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: String,
  date: String,
  description: String,
  userType: String,
  userId: String
});

module.exports = mongoose.model('Announcement', announcementSchema);