const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get menu items by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }
    
    const menuItems = await MenuItem.find(query);
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;