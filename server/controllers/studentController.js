const jwt = require('jsonwebtoken');
const path = require('path');
const Student = require('../models/Student');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new student
// @route   POST /studentsignup
// @access  Public
exports.registerStudent = async (req, res) => {
  try {
    const { ktuid, username, department, email, password } = req.body;
    
    // Check if student already exists
    const studentExists = await Student.findOne({ 
      $or: [{ email }, { ktuid }] 
    });
    
    if (studentExists) {
      return res.status(400).json({
        success: false,
        error: 'Student already exists with this email or KTU ID'
      });
    }
    
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an ID image'
      });
    }
    
    // Create new student
    const student = await Student.create({
      ktuid,
      username,
      department,
      email,
      password,
      imagePath: `/dataset/known_faces/${req.file.filename}`
    });
    
    // Generate token
    const token = generateToken(student._id);
    
    // Set HTTP-only cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.status(201).json({
      success: true,
      token,
      student: {
        id: student._id,
        ktuid: student.ktuid,
        username: student.username,
        email: student.email
      }
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Login student
// @route   POST /studentlogin
// @access  Public
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Find student by email
    const student = await Student.findOne({ email });
    
    if (!student) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await student.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = generateToken(student._id);
    
    // Set HTTP-only cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.status(200).json({
      success: true,
      token,
      student: {
        id: student._id,
        ktuid: student.ktuid,
        username: student.username,
        email: student.email
      }
    });
  } catch (error) {
    console.error('Error logging in student:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Get student profile
// @route   GET /api/profile
// @access  Private
exports.getStudentProfile = async (req, res) => {
  try {
    // Since protect middleware adds the user to req.user, we can use that
    const student = await Student.findById(req.user.id).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Logout student
// @route   GET /studentlogout
// @access  Private
exports.logoutStudent = async (req, res) => {
  try {
    // Clear the token cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // 10 seconds
      httpOnly: true,
      domain: 'localhost',
      sameSite: 'lax'
    });
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message
    });
  }
};