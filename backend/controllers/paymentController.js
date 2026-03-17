const Order = require("../models/Order");
const {
  sendOrderInitiatedAlert,
  sendOrderReceivedEmail,
  sendStatusUpdateEmail,
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

    // Notify admin immediately when a new order is created.
    try {
      await sendOrderInitiatedAlert(newOrder);
      console.log("[EMAIL] Admin alert sent for order:", newOrder._id);
    } catch (emailErr) {
      console.error(`[EMAIL ERROR] Admin alert failed for order ${newOrder._id}:`, emailErr.message);
    }

    // Also notify the customer that we've received their order.
    try {
      const customerEmail = newOrder.customerDetails.email;
      await sendOrderReceivedEmail(newOrder, customerEmail);
      console.log("[EMAIL] Customer confirmation sent to:", customerEmail);
    } catch (emailErr) {
      console.error(`[EMAIL ERROR] Customer confirmation failed for order ${newOrder._id}:`, emailErr.message);
    }

    sendWhatsappAlert(
      `🆕 New Order #${newOrder._id.toString().slice(-8)} initiated for ₹${totalAmount}. Please check dashboard.`,
    ).catch(console.error);

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
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Mark payment as completed once the customer confirms they paid.
    if (order.status === "Order Placed") {
      order.status = "Payment Completed";
      await order.save();
    }

    // Trigger notification to admin
    const paymentSignalResult = await sendUserClaimsPaidEmail(order);
    if (!paymentSignalResult?.ok) {
      console.error(
        `[EMAIL] Failed to send payment-completed admin email for order ${order._id}:`,
        paymentSignalResult?.error || "Unknown error",
      );
    }
    sendWhatsappAlert(
      `💰 Payment Verification Requested! ${order.customerDetails.name} claims they paid ₹${order.totalAmount} for Order #${order._id.toString().slice(-8)}.`,
    ).catch(console.error);

    return res
      .status(200)
      .json({ message: "Payment completion signal sent to admin." });
  } catch (error) {
    console.error("confirmPayment error:", error);
    return res.status(500).json({
      message: "Failed to process confirmation.",
      error: error.message,
    });
  }
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
