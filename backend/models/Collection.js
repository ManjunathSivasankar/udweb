const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  collectionId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Collection", collectionSchema);
