const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID or 'guest'
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
  },
  shippingMethod: { type: String, default: "Standard" }, // Standard or Courier

  items: [
    {
      productId: { type: String },
      name: { type: String },
      price: { type: Number },
      image: { type: String },
      size: { type: String },
      quantity: { type: Number },
    },
  ],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "Order Placed",
      "Payment Completed",
      "Order Confirmed",
      "Preparing for Dispatch",
      "Shipped",
      "Delivered",
      "Cancelled",
    ],
    default: "Order Placed",
  },
  // UPI Payment fields
  paymentMethod: { type: String, default: "UPI" },
  upiLink: { type: String }, // Generated UPI intent deep-link
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
