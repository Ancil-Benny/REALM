const express = require('express');
const router = express.Router();
const { 
  getAddItems, 
  getListedItems, 
  getRequestedItems, 
  addListedItem, 
  addRequestedItem,
  compareAnswers,
  verifyAnswers
} = require('../controllers/listingController');
const { protect, optionalProtect } = require('../middleware/auth');

// Public routes
router.get('/additems', getAddItems);
router.get('/api/listeditems', getListedItems);
router.get('/api/reqitems', getRequestedItems);
router.post('/api/compare-answers', compareAnswers);

// New verification endpoint
router.post('/api/verify-answers', optionalProtect, verifyAnswers);

// Protected routes (require authentication)
router.post('/addquestsubmit', protect, addListedItem);
router.post('/newreqsubmit', protect, addRequestedItem);

module.exports = router;