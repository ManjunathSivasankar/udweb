const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  confirmPayment,
  getPaymentStatus,
} = require("../controllers/paymentController");
const { optionalVerifyToken } = require("../middleware/authMiddleware");

// POST /api/payment/initiate  – works for both logged-in and guest users
router.post("/initiate", optionalVerifyToken, initiatePayment);

// POST /api/payment/confirm/:orderId – signal from user that they've paid
router.post("/confirm/:orderId", confirmPayment);

// GET  /api/payment/status/:orderId  – public (frontend polling)
router.get("/status/:orderId", getPaymentStatus);

module.exports = router;
