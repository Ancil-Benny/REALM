const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Protect routes - requires authentication
exports.protect = async (req, res, next) => {
  let token;
  
  // Check for auth header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer')) {
    // Get token from header
    token = authHeader.split(' ')[1];
  } 
  // Also check for token in cookies as fallback
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token found
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await Student.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired'
    });
  }
};

// Optional protect - works with or without authentication
exports.optionalProtect = async (req, res, next) => {
  let token;
  
  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  // If no token, just continue (optional auth)
  if (!token) {
    return next();
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await Student.findById(decoded.id).select('-password');
    
    next();
  } catch (error) {
    // Just continue without setting user
    next();
  }
};