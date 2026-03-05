const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID or 'guest'
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
  },
  items: [
    {
      productId: { type: String },
      name: { type: String },
      price: { type: Number },
      size: { type: String },
      quantity: { type: Number },
    },
  ],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "pending" }, // pending, completed, cancelled
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
