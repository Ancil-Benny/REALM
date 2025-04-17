const Item = require('../models/item');

// @desc    Search for items based on criteria
// @route   GET /api/items/search
// @access  Public
exports.searchItems = async (req, res) => {
  try {
    const { category, objectName, brand, color, date, fields } = req.query;
    
    // Log received search parameters
    console.log('Search request received with params:', { category, objectName, brand, color, date, fields });
    
    // Build query object based on provided parameters
    const queryObject = {};
    
    // Map objectName to name field in MongoDB
    if (category) queryObject.category = { $regex: category, $options: 'i' };
    if (objectName) queryObject.name = { $regex: objectName, $options: 'i' }; // Note: using 'name' field
    if (brand) queryObject.brand = { $regex: brand, $options: 'i' };
    if (color) queryObject.color = { $regex: color, $options: 'i' };
    
    // Build projection object for field selection
    let projection = {};
    if (fields) {
      const fieldList = fields.split(',');
      fieldList.forEach(field => {
        projection[field.trim()] = 1;
      });
    }
    
    // If date is provided, use date aggregation to match items by date
    if (date) {
      const searchDate = new Date(date);
      console.log('Searching for date:', searchDate.toISOString());
      
      // Use MongoDB aggregation to match by date parts
      const pipeline = [
        {
          $addFields: {
            // Extract year, month, day from the timestamp
            dateYMD: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
            }
          }
        },
        {
          $match: {
            // Match other criteria
            ...(category ? { category: new RegExp(category, 'i') } : {}),
            ...(objectName ? { name: new RegExp(objectName, 'i') } : {}), // Note: using 'name' field
            ...(brand ? { brand: new RegExp(brand, 'i') } : {}),
            ...(color ? { color: new RegExp(color, 'i') } : {}),
            // Match the date string format
            dateYMD: searchDate.toISOString().split('T')[0]
          }
        },
        { $sort: { timestamp: -1 } },
        { $limit: 10 }
      ];
      
      // Add projection stage if fields are specified
      if (Object.keys(projection).length > 0) {
        pipeline.push({ $project: projection });
      }
      
      const items = await Item.aggregate(pipeline);
      
      console.log(`Found ${items.length} items based on date matching`);
      return res.json(items);
    }
    
    // If no date specified, use regular query
    console.log('MongoDB query:', JSON.stringify(queryObject, null, 2));
    
    // Execute search with projection if fields are specified
    let query = Item.find(queryObject);
    
    if (Object.keys(projection).length > 0) {
      query = query.select(projection);
    }
    
    const items = await query
      .sort({ timestamp: -1 }) // Most recent first
      .limit(10);
    
    console.log(`Found ${items.length} items`);
    if (items.length > 0) {
      console.log('First item:', items[0]);
    }
    
    res.json(items);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all items
// @route   GET /api/items
// @access  Public
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ timestamp: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a new item
// @route   POST /api/items
// @access  Public (would be protected in production)
exports.addItem = async (req, res) => {
  try {
    const newItem = new Item({
      objectName: req.body.objectName,
      category: req.body.category,
      color: req.body.color,
      brand: req.body.brand,
      details: req.body.details,
      location: req.body.location,
      person: req.body.person || 'Unknown'
    });

    const item = await newItem.save();
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};