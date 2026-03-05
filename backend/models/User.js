const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String },
  GaragetItems: [
    {
      GaragetId: { type: String, required: true },
      productId: { type: String, required: true },
      name: { type: String },
      price: { type: Number },
      image: { type: String },
      size: { type: String },
      quantity: { type: Number, default: 1 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
