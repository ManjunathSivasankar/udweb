const nodemailer = require("nodemailer");

/**
 * notificationService
 * Handles sending emails using Brevo (formerly Sendinblue) for production reliability.
 * 
 * Requirements: BREVO_SMTP_HOST, BREVO_SMTP_PORT, BREVO_SMTP_USER, BREVO_SMTP_KEY, FROM_EMAIL, ADMIN_EMAIL in .env
 */

const getEnv = (key, fallback = "") => {
  const value = process.env[key];
  if (typeof value !== "string") return fallback;
  return value.trim().replace(/^["']|["']$/g, "");
};

const BREVO_HOST = getEnv("BREVO_SMTP_HOST", "smtp-relay.brevo.com");
const BREVO_PORT = Number(getEnv("BREVO_SMTP_PORT", "587"));
const BREVO_USER = getEnv("BREVO_SMTP_USER");
const BREVO_KEY = getEnv("BREVO_SMTP_KEY");
const FROM_EMAIL = getEnv("FROM_EMAIL");
const ADMIN_EMAIL = getEnv("ADMIN_EMAIL");

const createTransporter = () => {
  if (!BREVO_USER || !BREVO_KEY) {
    console.warn("[EMAIL] Brevo credentials missing. Email notifications will fail.");
    return null;
  }

  return nodemailer.createTransport({
    host: BREVO_HOST,
    port: BREVO_PORT,
    secure: BREVO_PORT === 465, // Use SSL for 465, TLS/STARTTLS for 587
    auth: {
      user: BREVO_USER,
      pass: BREVO_KEY,
    },
    // Force IPv4 to avoid ENETUNREACH on Render's network
    family: 4,
  });
};

const sendEmail = async (mailOptions) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const mailData = {
    from: FROM_EMAIL,
    to: mailOptions.to,
    subject: mailOptions.subject,
    text: mailOptions.text,
    html: mailOptions.html,
  };

  try {
    console.log("[EMAIL] Sending email via Brevo to:", mailData.to);
    const info = await transporter.sendMail(mailData);
    console.log("[EMAIL] Email sent successfully:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL ERROR]:", error.message);
    throw error;
  }
};

const sendOrderInitiatedAlert = async (order) => {
  const emailBody = `
    New Order Received!
    Order ID: ${order.orderId || order._id}
    Total Amount: ₹${order.totalAmount}
    Customer: ${order.customerDetails.name}
    Phone: ${order.customerDetails.phone}
  `;

  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Order Alert: #${order.orderId || order._id}`,
      text: emailBody,
    });
  } catch (error) {
    console.error(`[EMAIL] Failed to send admin alert for order ${order._id}`);
  }
};

const sendOrderReceivedEmail = async (order, customerEmail) => {
  const emailBody = `
    Hello ${order.shippingAddress.name},
    Your order #${order.orderId || order._id} has been received and is being processed.
    Total Amount: ₹${order.totalAmount}
  `;

  try {
    await sendEmail({
      to: customerEmail,
      subject: `Order Received: #${order.orderId || order._id}`,
      text: emailBody,
    });
  } catch (error) {
    console.error(`[EMAIL] Failed to send confirmation email to ${customerEmail}`);
  }
};

const sendStatusUpdateEmail = async (order, customerEmail, status) => {
  const emailBody = `
    Hello ${order.shippingAddress.name},
    Your order #${order.orderId || order._id} status has been updated to: ${status}.
  `;

  try {
    await sendEmail({
      to: customerEmail,
      subject: `Order Status Update: #${order.orderId || order._id}`,
      text: emailBody,
    });
  } catch (error) {
    console.error(`[EMAIL] Failed to send status update to ${customerEmail}`);
  }
};

const verifyEmailConfig = async () => {
  const transporter = createTransporter();
  if (!transporter) return false;
  try {
    await transporter.verify();
    console.log("[EMAIL] Brevo SMTP connection verified.");
    return true;
  } catch (error) {
    console.error("[EMAIL] Brevo verification failed:", error.message);
    return false;
  }
};

const sendTestEmail = async (to) => {
  return await sendEmail({
    to,
    subject: "Brevo SMTP Test",
    text: "This is a test email to verify Brevo SMTP on production.",
  });
};

const sendMailWithRetry = async (options) => {
  return await sendEmail(options);
};

module.exports = {
  sendOrderInitiatedAlert,
  sendOrderReceivedEmail,
  sendStatusUpdateEmail,
  verifyEmailConfig,
  sendTestEmail,
  sendMailWithRetry,
  // Payment confirmation (Success)
  sendOrderConfirmedEmail: async (order) => {
    return await sendStatusUpdateEmail(order, order.customerDetails.email, "Confirmed");
  },
  // Placeholders for other status updates if needed by other controllers
  sendOrderDispatchedEmail: async (order) => {
    return await sendStatusUpdateEmail(order, order.customerDetails.email, "Dispatched");
  },
  sendOrderShippedEmail: async (order) => {
    return await sendStatusUpdateEmail(order, order.customerDetails.email, "Shipped");
  },
  sendOrderDeliveredEmail: async (order) => {
    return await sendStatusUpdateEmail(order, order.customerDetails.email, "Delivered");
  },
  sendOrderCancelledEmail: async (order) => {
    return await sendStatusUpdateEmail(order, order.customerDetails.email, "Cancelled");
  },
  sendUserClaimsPaidEmail: async (order) => {
    // This was used when a customer clicks "I have paid"
    return await sendEmail({
      to: ADMIN_EMAIL,
      subject: `✅ Payment Claimed - Order #${order.orderId || order._id}`,
      text: `Customer ${order.customerDetails.name} has marked payment as completed for ₹${order.totalAmount}.`
    });
  },
  sendWhatsappAlert: async (message) => {
    console.log("[WHATSAPP] Alert (Mocked):", message);
  }
};