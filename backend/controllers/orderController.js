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

// Get all orders for admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching all orders", error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Order Placed",
      "Payment Completed",
      "Order Confirmed",
      "Preparing for Dispatch",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.status;
    if (previousStatus === status) {
      return res
        .status(200)
        .json({ message: "Order status unchanged", order });
    }

    order.status = status;
    await order.save();

    // Trigger customer emails based on new status
    const {
      sendStatusUpdateEmail,
    } = require("../services/notificationService");

    try {
      if (order.customerDetails && order.customerDetails.email) {
        await sendStatusUpdateEmail(order, order.customerDetails.email, status);
        console.log(`[EMAIL] Status update (${status}) sent to:`, order.customerDetails.email);
      }
    } catch (emailErr) {
      console.error(`[EMAIL ERROR] Status update failed for order ${order._id}:`, emailErr.message);
    }

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting order", error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
