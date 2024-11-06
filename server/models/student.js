const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  ktuid: {
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
  },
  idImage: {
    type: String,
    required: true
  },
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
  semester: {
    type: Number,
    
  },
  contributions: {
    type: Number,
    default: 0
  },
  verify: {
    type: Boolean,
    default: false
  },  

});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;