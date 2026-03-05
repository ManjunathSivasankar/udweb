const express = require("express");
const Testimonial = require("../models/Testimonial");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find({});
    res.json(testimonials);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
