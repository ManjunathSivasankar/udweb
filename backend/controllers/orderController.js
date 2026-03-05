const Order = require("../models/Order");

// Create new order
const createOrder = async (req, res) => {
  try {
    const {
      customerDetails,
      shippingAddress,
      items,
      subtotal,
      shippingFee,
      totalAmount,
    } = req.body;

    const userId = req.user ? req.user.uid : "guest"; // Can be 'guest' if unauthenticated checkout allowed

    const newOrder = new Order({
      userId,
      customerDetails,
      shippingAddress,
      items,
      subtotal,
      shippingFee,
      totalAmount,
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order placed successfully", orderId: newOrder._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
};

// Get user orders (Optional future feature for Order History page)
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.uid }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
};
