const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  images: [String],
  fabric: { type: String },
  color: { type: String },
  sizes: [String],
  createdAt: { type: Date, default: Date.now },
});

// Add operational indexes for common query patterns
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
