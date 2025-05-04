const express = require('express');
const router = express.Router();
const { 
  registerStudent, 
  loginStudent,
  getStudentProfile,
  logoutStudent
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/studentsignup', upload.single('idImage'), registerStudent);
router.post('/studentlogin', loginStudent);
router.get('/studentlogout', logoutStudent);

// Protected routes
router.get('/studentprofile', protect, getStudentProfile);

// Add this route to your existing routes

// Get user profile using JWT token
router.get('/api/profile', protect, getStudentProfile);

// Logout endpoint
router.post('/api/logout', protect, logoutStudent);

module.exports = router;