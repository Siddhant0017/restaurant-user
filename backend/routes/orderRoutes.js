const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Client = require('../models/Client');

const generateOrderNumber = async () => {
  //  the current date in YYYYMMDD format
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  
  // Count orders from today to determine the sequence number
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const count = await Order.countDocuments({
    createdAt: { $gte: todayStart }
  });
  
 
  return `${dateStr}-${(count + 1).toString().padStart(3, '0')}`;
};

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { clientPhone, items, type, totalAmount, deliveryAddress, cookingInstructions } = req.body;
    
    // Validate client exists
    const client = await Client.findOne({ phone: clientPhone });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    // Generate order number
    const orderNumber = await generateOrderNumber();
    
    
    const mappedType = type === 'take-away' ? 'takeaway' : type;
    
    // Create new order
    const newOrder = new Order({
      orderNumber,
      clientPhone,
      items,
      type: mappedType,
      totalAmount,
      deliveryAddress,
      cookingInstructions,
     
      tableId: mappedType === 'takeaway' ? null : undefined
    });
    
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (status) {
      order.status = status;
    }
    
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;