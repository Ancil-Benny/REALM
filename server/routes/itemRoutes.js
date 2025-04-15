const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// @route   GET api/items/search
// @desc    Search for items based on criteria
// @access  Public
router.get('/search', itemController.searchItems);

// @route   GET api/items
// @desc    Get all items
// @access  Public
router.get('/', itemController.getAllItems);

// @route   POST api/items
// @desc    Add a new item
// @access  Public (would be protected in production)
router.post('/', itemController.addItem);

module.exports = router;