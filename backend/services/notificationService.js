const SibApiV3Sdk = require("sib-api-v3-sdk");

/**
 * notificationService
 * Handles sending emails using Brevo (formerly Sendinblue) API for production reliability.
 * 
 * Requirements: BREVO_API_KEY, FROM_EMAIL, ADMIN_EMAIL in .env
 */

const getEnv = (key, fallback = "") => {
  const value = process.env[key];
  if (typeof value !== "string") return fallback;
  return value.trim().replace(/^["']|["']$/g, "");
};

// Initialize Brevo API variables for sender/admin
const BREVO_API_KEY = getEnv("BREVO_API_KEY") || getEnv("BREVO_SMTP_KEY") || getEnv("SMTP_PASS");
const FROM_EMAIL = getEnv("FROM_EMAIL") || getEnv("SMTP_USER");
const ADMIN_EMAIL = getEnv("ADMIN_EMAIL") || getEnv("SMTP_USER");

// DEBUG LOGS (Masked)
if (BREVO_API_KEY) {
  const maskedKey = BREVO_API_KEY.substring(0, 10) + "..." + BREVO_API_KEY.substring(BREVO_API_KEY.length - 4);
  console.log(`[EMAIL DEBUG] Loaded Key: ${maskedKey} (Length: ${BREVO_API_KEY.length})`);
  if (!BREVO_API_KEY.startsWith("xkeysib-")) {
    console.warn("[EMAIL DEBUG] WARNING: API Key does not start with 'xkeysib-'.");
  }
} else {
  console.error("[EMAIL DEBUG] ERROR: BREVO_API_KEY is missing/empty.");
}

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (mailOptions) => {
  if (!BREVO_API_KEY) {
    console.warn("[EMAIL] Brevo API Key missing. Email notifications will fail.");
    return { ok: false, error: "API Key missing" };
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = mailOptions.subject;
  sendSmtpEmail.htmlContent = mailOptions.html || mailOptions.text;
  sendSmtpEmail.sender = { email: FROM_EMAIL, name: "UrbanDos" };
  sendSmtpEmail.to = [{ email: mailOptions.to }];

  try {
    console.log("[EMAIL] Sending email via Brevo API to:", mailOptions.to);
    
    // Ensure API Key is assigned just before call (double-check singleton state)
    if (apiKey.apiKey !== BREVO_API_KEY) {
      apiKey.apiKey = BREVO_API_KEY;
    }

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("[EMAIL] API call successful. Message ID:", data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error("[EMAIL ERROR FULL]:", error.response ? error.response.body : error);
    console.error("[EMAIL ERROR MESSAGE]:", error.message);
    if (error.response && error.response.body) {
      console.error("[EMAIL ERROR CODE]:", error.response.body.code);
    }
    throw error;
  }
};

const sendOrderInitiatedAlert = async (order) => {
  const emailBody = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>New Order Received!</h2>
      <p><strong>Order ID:</strong> ${order.orderId || order._id}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p><strong>Customer:</strong> ${order.customerDetails.name}</p>
      <p><strong>Phone:</strong> ${order.customerDetails.phone}</p>
    </div>
  `;

  try {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Order Alert: #${order.orderId || order._id}`,
      html: emailBody,
    });
  } catch (error) {
    console.error(`[EMAIL] Failed to send admin alert for order ${order._id}`);
  }
};

const sendOrderReceivedEmail = async (order, customerEmail) => {
  const emailBody = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Hello ${order.shippingAddress.name},</h2>
      <p>Your order <strong>#${order.orderId || order._id}</strong> has been received and is being processed.</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p>Thank you for shopping with UrbanDos!</p>
    </div>
  `;

  try {
    await sendEmail({
      to: customerEmail,
      subject: `Order Received: #${order.orderId || order._id}`,
      html: emailBody,
    });
  } catch (error) {
    console.error(`[EMAIL] Failed to send confirmation email to ${customerEmail}`);
  }
};

const sendStatusUpdateEmail = async (order, customerEmail, status) => {
  const emailBody = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Hello ${order.shippingAddress.name},</h2>
      <p>Your order <strong>#${order.orderId || order._id}</strong> status has been updated to: <strong>${status}</strong>.</p>
    </div>
  `;

  try {
    await sendEmail({
      to: customerEmail,
      subject: `Order Status Update: #${order.orderId || order._id}`,
      html: emailBody,
    });
  } catch (error) {
    console.error(`[EMAIL] Failed to send status update to ${customerEmail}`);
  }
};

const verifyEmailConfig = async () => {
  if (!BREVO_API_KEY) return { ok: false, error: "API Key missing" };
  
  try {
    const accountApi = new SibApiV3Sdk.AccountApi();
    await accountApi.getAccount();
    console.log("[EMAIL] Brevo API connection verified.");
    return { ok: true };
  } catch (error) {
    console.error("[EMAIL] Brevo API verification failed:", error.message);
    return { ok: false, error: error.message };
  }
};

const sendTestEmail = async (to) => {
  try {
    const result = await sendEmail({
      to,
      subject: "Brevo API Test",
      text: "This is a test email to verify Brevo API on production.",
      html: "<h3>This is a test email to verify Brevo API on production.</h3>"
    });
    return { ok: true, info: result };
  } catch (error) {
    return { ok: false, error: error.message };
  }
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
  sendOrderConfirmedEmail: async (order) => {
    return await sendStatusUpdateEmail(order, order.customerDetails.email, "Confirmed");
  },
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