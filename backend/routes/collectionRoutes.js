const express = require("express");
const Collection = require("../models/Collection");

const router = express.Router();

// @route   GET /api/collections
// @desc    Get all collections
// @access  Public
router.get("/", async (req, res) => {
  try {
    const collections = await Collection.find({});
    res.json(collections);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
