const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
} = require("../controllers/orderController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, createOrder); // Require auth to place order on this endpoint
router.get("/", verifyToken, getUserOrders);
router.post("/:id/cancel", verifyToken, cancelOrder);

// Admin routes
router.get("/admin/all", getAllOrders);
router.put("/admin/:id/status", updateOrderStatus);
router.delete("/admin/:id", deleteOrder);

module.exports = router;
