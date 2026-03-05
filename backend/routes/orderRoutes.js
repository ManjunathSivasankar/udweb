const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
} = require("../controllers/orderController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, createOrder); // Require auth to place order on this endpoint
router.get("/", verifyToken, getUserOrders);

module.exports = router;
