const Order = require("../models/Order");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure storage for payment screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/payments";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "payment-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png) are allowed."));
  },
}).single("screenshot");

const {
  sendOrderInitiatedAlert,
  sendOrderReceivedEmail,
  sendStatusUpdateEmail,
  sendUserClaimsPaidEmail,
  sendWhatsappAlert,
} = require("../services/notificationService");

// ─── 1. Initiate Payment ──────────────────────────────────────────────────────
// POST /api/payment/initiate
const initiatePayment = async (req, res) => {
  try {
    const {
      customerDetails,
      shippingAddress,
      items,
      subtotal,
      shippingFee,
      totalAmount,
      shippingMethod,
    } = req.body;

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid order amount." });
    }

    const merchantUpi = process.env.MERCHANT_UPI_ID;
    const merchantName = process.env.MERCHANT_NAME || "Store";

    if (!merchantUpi) {
      return res.status(500).json({
        message:
          "Merchant UPI ID is not configured. Please set MERCHANT_UPI_ID in backend/.env",
      });
    }

    const userId = req.user ? req.user.uid : "guest";

    const newOrder = new Order({
      userId,
      customerDetails: {
        name: customerDetails.name,
        phone: customerDetails.phone,
        email: customerDetails.email,
      },
      shippingAddress,
      items,
      subtotal,
      shippingFee: shippingFee || 0,
      totalAmount,
      shippingMethod: shippingMethod || "Standard",
      paymentMethod: "UPI",
      status: "Order Placed",
    });

    await newOrder.save();

    const upiLink =
      `upi://pay` +
      `?pa=${encodeURIComponent(merchantUpi)}` +
      `&pn=${encodeURIComponent(merchantName)}` +
      `&am=${totalAmount.toFixed(2)}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent("Order-" + newOrder._id.toString().slice(-8))}`;

    newOrder.upiLink = upiLink;
    await newOrder.save();

    console.log("[PAYMENT] Order created and UPI link generated:", newOrder._id);

    // Notify customer that order is initiated
    (async () => {
      try {
        const customerEmail = newOrder.customerDetails.email;
        await sendOrderReceivedEmail(newOrder, customerEmail);
        console.log("[EMAIL] Customer confirmation sent to:", customerEmail);
      } catch (bgErr) {
        console.error(`[BACKGROUND NOTIFY ERROR] Order ${newOrder._id}:`, bgErr.message);
      }
    })();

    return res.status(201).json({
      orderId: newOrder._id,
      upiLink,
      amount: totalAmount,
    });
  } catch (error) {
    console.error("initiatePayment error:", error);
    return res
      .status(500)
      .json({ message: "Failed to initiate payment", error: error.message });
  }
};

// ─── 2. Confirm Payment (User Signal) ──────────────────────────────────────────
// POST /api/payment/confirm/:orderId
const confirmPayment = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Mark payment as completed once the customer confirms they paid.
      if (order.status === "Order Placed") {
        order.status = "Order Confirmed"; // Requirement 8: First status "Order Confirmed"
        if (req.file) {
          order.paymentScreenshot = `/uploads/payments/${req.file.filename}`;
        }
        await order.save();
      }

      // Trigger notifications in the background
      (async () => {
        try {
          // Send notification with screenshot to admin
          await sendOrderInitiatedAlert(order);
          
          await sendWhatsappAlert(
            `💰 Payment Verification Requested! ${order.customerDetails.name} claims they paid ₹${order.totalAmount} for Order #${order._id.toString().slice(-8)}.`,
          );
        } catch (bgErr) {
          console.error(
            `[BACKGROUND NOTIFY ERROR] order ${order._id}:`,
            bgErr.message,
          );
        }
      })();

      return res
        .status(200)
        .json({ message: "Order confirmed. Admin will verify payment." });
    } catch (error) {
      console.error("confirmPayment error:", error);
      return res.status(500).json({
        message: "Failed to process confirmation.",
        error: error.message,
      });
    }
  });
};

// ─── 3. Get Payment Status ────────────────────────────────────────────────────
// GET /api/payment/status/:orderId
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).select(
      "status totalAmount createdAt customerDetails",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      paymentStatus: order.status,
      totalAmount: order.totalAmount,
      adminPhone: process.env.ADMIN_PHONE || "",
    });
  } catch (error) {
    console.error("getPaymentStatus error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching payment status", error: error.message });
  }
};

module.exports = { initiatePayment, confirmPayment, getPaymentStatus };
