const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  facid: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  } ,
  profileImage: {
    type: String,
   
  },
  firstName: {
    type: String,
    
  },
  lastName: {
    type: String,
  
  },
  department: {
    type: String,
   
  },
});

const faculty = mongoose.model('faculty', FacultySchema);

module.exports = faculty;