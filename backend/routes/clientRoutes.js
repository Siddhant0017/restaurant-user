const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Create or update client
router.post('/', async (req, res) => {
  try {
    const { phone, name } = req.body;
    
    //  if client already exists
    let client = await Client.findOne({ phone });
    
    if (client) {
      // Update existing client
      client.visits += 1;
      client.lastVisit = Date.now();
      
      // Update name if provided
      if (name) {
        client.name = name;
      }
      
      await client.save();
      res.json(client);
    } else {
      // Create new client
      const newClient = new Client({
        phone,
        name: name || '',
        visits: 1,
        lastVisit: Date.now()
      });
      
      await newClient.save();
      res.status(201).json(newClient);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get client by phone
router.get('/:phone', async (req, res) => {
  try {
    const client = await Client.findOne({ phone: req.params.phone });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update client
router.put('/:phone', async (req, res) => {
  try {
    const { name } = req.body;
    
    const client = await Client.findOne({ phone: req.params.phone });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    if (name) {
      client.name = name;
    }
    
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;