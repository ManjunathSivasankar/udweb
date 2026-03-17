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
  sendMailWithRetry
};


  const adminPhone = process.env.ADMIN_PHONE;
  // We encourage using a simple HTTP API gateway for WhatsApp (like CallMeBot)
  // Example URL in .env: https://api.callmebot.com/whatsapp.php?phone=[phone]&apikey=[key]&text=[text]
  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;

  if (!gatewayUrl) {
    return;
  }

  try {
    const finalUrl = gatewayUrl
      .replace("[phone]", encodeURIComponent(adminPhone))
      .replace("[text]", encodeURIComponent(message));

    const https = require("https");
    https.get(finalUrl, (res) => {
      if (res.statusCode === 200) {
        console.log("✅ WhatsApp alert sent successfully.");
      } else {
        console.error("❌ WhatsApp alert failed with status:", res.statusCode);
      }
    });
  } catch (err) {
    console.error("❌ Error sending WhatsApp alert:", err.message);
  }
};

const sendOrderInitiatedEmail = async (order) => {
  try {
    if (!hasSmtpConfig()) {
      return { ok: false, error: "Missing SMTP configuration" };
    }

    const adminEmail = getEnv("ADMIN_EMAIL") || getEnv("SMTP_USER");

    if (!adminEmail) {
      console.warn("[EMAIL] ADMIN_EMAIL is missing. Skipping order initiated email.");
      return { ok: false, error: "ADMIN_EMAIL is missing" };
    }

    console.log(`[EMAIL] Attempting to send Admin Order Alert for #${order._id.toString().slice(-8)}`);

    const mailOptions = {
      from: `"UrbanDos Payments" <${getFromAddress()}>`,
      to: adminEmail,
      subject: `🆕 New Order Initiated - ₹${order.totalAmount}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #333; text-transform: uppercase;">New Order Started</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Shipping Method:</strong> ${order.shippingMethod}</p>
          <hr />
          <h3>Items:</h3>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${order.items
              .map(
                (item) => `
              <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                ${item.image ? `<img src="${item.image}" width="40" height="50" style="object-fit: cover; border-radius: 4px;" />` : ""}
                <div>
                  <p style="margin: 0; font-size: 14px;"><strong>${item.name}</strong> (${item.size})</p>
                  <p style="margin: 0; font-size: 12px; color: #666;">Qty: ${item.quantity} - ₹${item.price * item.quantity}</p>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          <hr />
          <h3>Customer Details:</h3>
          <p><strong>Name:</strong> ${order.customerDetails.name}</p>
          <p><strong>Phone:</strong> ${order.customerDetails.phone}</p>
          <p><strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.pinCode}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">This is an automated notification. Payment is currently <strong>PENDING</strong>.</p>
        </div>
      `,
    };

    const info = await sendMailWithRetry(mailOptions, "Order initiated");
    console.log("[EMAIL] Order initiated email sent to admin.");
    return { ok: true, accepted: info?.accepted || [], messageId: info?.messageId };
  } catch (error) {
    console.error(
      "[EMAIL] Error sending order initiated email:",
      error.code || error.message,
    );
    return { ok: false, error: error.code || error.message };
  }
};

const sendOrderReceivedEmail = async (order) => {
  try {
    if (!hasSmtpConfig()) return { ok: false, error: "Missing SMTP configuration" };
    const customerEmail = (order.customerDetails?.email || "").trim();
    if (!customerEmail) return { ok: false, error: "No customer email found" };

    console.log(`[EMAIL] Attempting to send Order Received email to customer: ${customerEmail}`);

    const mailOptions = {
      from: `"UrbanDos" <${getFromAddress()}>`,
      to: customerEmail,
      subject: `🛒 Order Received! #${order._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #333; text-transform: uppercase;">Order Received</h2>
          <p>Hi ${order.customerDetails.name},</p>
          <p>Thank you for your order! We've received your order <strong>#${order._id.toString().slice(-8)}</strong> for <strong>₹${order.totalAmount}</strong>.</p>
          <p>If you haven't completed the UPI payment yet, please do so. Once our team verifies your payment, your order will move to the "Confirmed" stage. 🚀</p>
          <hr />
          <p>Thank you for shopping with UrbanDos!</p>
        </div>
      `,
    };

    const info = await sendMailWithRetry(mailOptions, "Order received");
    console.log(`[EMAIL] Order received email sent to customer: ${customerEmail}`);
    return { ok: true, accepted: info?.accepted || [], messageId: info?.messageId };
  } catch (error) {
    console.error("[EMAIL] Error sending order received email:", error.code || error.message);
    return { ok: false, error: error.code || error.message };
  }
};

const sendUserClaimsPaidEmail = async (order) => {
  try {
    if (!hasSmtpConfig()) {
      return { ok: false, error: "Missing SMTP configuration" };
    }

    const adminEmail = getEnv("ADMIN_EMAIL") || getEnv("SMTP_USER");

    if (!adminEmail) {
      console.warn("[EMAIL] ADMIN_EMAIL is missing. Skipping payment-claim email.");
      return { ok: false, error: "ADMIN_EMAIL is missing" };
    }

    const waLink = `https://wa.me/${order.customerDetails.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Hi ${order.customerDetails.name}, your order ${order._id.toString().slice(-8)} for ₹${order.totalAmount} has been confirmed! 🚀`,
    )}`;

    const mailOptions = {
      from: `"UrbanDos Payments" <${getFromAddress()}>`,
      to: adminEmail,
      subject: `✅ Customer Marked Payment Completed - ${order.customerDetails.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #27ae60; text-transform: uppercase;">Customer Completed Payment</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>User:</strong> ${order.customerDetails.name}</p>
          <p><strong>Amount:</strong> ₹${order.totalAmount}</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
            <p style="margin-bottom: 20px;"><strong>Action Required:</strong> Verify the payment in your UPI/Bank app, then click below to notify the customer:</p>
            <a href="${waLink}" style="background-color: #25D366; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              CONFIRM VIA WHATSAPP
            </a>
          </div>
          
          <p style="font-size: 12px; color: #666;">Once you confirm via WhatsApp, please remember to update the order status to <strong>SUCCESS</strong> in your database/dashboard.</p>
        </div>
      `,
    };

    const info = await sendMailWithRetry(mailOptions, "Payment-claim");
    console.log("[EMAIL] Payment-claim email sent to admin.");
    return { ok: true, accepted: info?.accepted || [], messageId: info?.messageId };
  } catch (error) {
    console.error(
      "[EMAIL] Error sending user claims paid email:",
      error.code || error.message,
    );
    return { ok: false, error: error.code || error.message };
  }
};

const sendOrderConfirmedEmail = async (order) => {
  try {
    if (!hasSmtpConfig()) {
      return { ok: false, error: "Missing SMTP configuration" };
    }

    const customerEmail =
      (order.customerDetails?.email || order.shippingAddress?.email || "").trim();

    if (!customerEmail) {
      console.warn("⚠️ No customer email found for order:", order._id);
      return { ok: false, error: "No customer email found" };
    }

    const mailOptions = {
      from: `"UrbanDos" <${getFromAddress()}>`,
      to: customerEmail,
      subject: `✅ Order Placed & Payment Confirmed! #${order._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #27ae60; text-transform: uppercase;">Order Placed Successfully</h2>
          <p>Hi ${order.customerDetails.name},</p>
          <p>Your order <strong>#${order._id.toString().slice(-8)}</strong> has been placed successfully.</p>
          <p>Payment has been confirmed, and our team will deliver your product soon. 🚀</p>
          <hr />
          <h3>Order Summary:</h3>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Shipping to:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
          <hr />
          <p>Thank you for shopping with UrbanDos!</p>
          <p style="font-size: 12px; color: #666;">This is an automated confirmation of your manual payment verification.</p>
        </div>
      `,
    };

    const info = await sendMailWithRetry(mailOptions, "Order confirmed");
    console.log(`[EMAIL] Confirmation email sent to customer: ${customerEmail}`);
    return {
      ok: true,
      to: customerEmail,
      accepted: info?.accepted || [],
      messageId: info?.messageId,
    };
  } catch (error) {
    console.error(
      "[EMAIL] Error sending order confirmation email:",
      error.code || error.message,
    );
    return { ok: false, error: error.code || error.message };
  }
};

const sendOrderDispatchedEmail = async (order) => {
  try {
    if (!hasSmtpConfig()) {
      return { ok: false, error: "Missing SMTP configuration" };
    }

    const customerEmail =
      (order.customerDetails?.email || order.shippingAddress?.email || "").trim();

    if (!customerEmail) {
      console.warn("⚠️ No customer email found for order:", order._id);
      return { ok: false, error: "No customer email found" };
    }

    const mailOptions = {
      from: `"UrbanDos" <${getFromAddress()}>`,
      to: customerEmail,
      subject: `🚚 Your Order is being Prepared for Dispatch! #${order._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #f39c12; text-transform: uppercase;">Preparing For Dispatch</h2>
          <p>Hi ${order.customerDetails.name},</p>
          <p>Great news! Your order <strong>#${order._id.toString().slice(-8)}</strong> is currently being prepared for dispatch.</p>
          <p>You will receive another update once the package has physically shipped to your location.</p>
          <hr />
          <h3>Shipping to:</h3>
          <p>${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pinCode}</p>
          <hr />
          <p>Thank you for shopping with UrbanDos!</p>
        </div>
      `,
    };

    const info = await sendMailWithRetry(mailOptions, "Order dispatched");
    console.log(`[EMAIL] Dispatch notification sent to customer: ${customerEmail}`);
    return {
      ok: true,
      to: customerEmail,
      accepted: info?.accepted || [],
      messageId: info?.messageId,
    };
  } catch (error) {
    console.error(
      "[EMAIL] Error sending order dispatch email:",
      error.code || error.message,
    );
    return { ok: false, error: error.code || error.message };
  }
};

// Export for health-check route in server.js
const verifyEmailConfig = async () => {
  if (!hasSmtpConfig()) {
    return {
      ok: false,
      error: "Missing SMTP env vars",
      config: {
        host: process.env.SMTP_HOST || "(not set)",
        port: getSmtpPort(),
        user: getEnv("SMTP_USER") || "(not set)",
        adminEmail: getEnv("ADMIN_EMAIL") || "(not set)",
        passSet: !!getEnv("SMTP_PASS"),
      },
    };
  }

  // Just return config without verifying connection (verify() times out on cloud providers).
  // Use /api/health/email/test to actually send a test email instead.
  return {
    ok: true,
    status: "Config loaded. Use /api/health/email/test to send a test email.",
    config: {
      host: process.env.SMTP_HOST,
      port: getSmtpPort(),
      user: getEnv("SMTP_USER"),
      adminEmail: getEnv("ADMIN_EMAIL"),
      passSet: !!getEnv("SMTP_PASS"),
    },
  };
};

const sendTestEmail = async (to) => {
  if (!hasSmtpConfig()) {
    return { ok: false, error: "Missing SMTP env vars" };
  }

  try {
    const transporter = createTransporter();
    const target = to || process.env.ADMIN_EMAIL;

    if (!target) {
      return { ok: false, error: "Missing target email and ADMIN_EMAIL" };
    }

    // Wrap in timeout (30 seconds max for sending)
    const emailPromise = transporter.sendMail({
      from: `"UrbanDos" <${getFromAddress()}>`,
      to: target,
      subject: "UrbanDos SMTP Test",
      text: "SMTP test successful from deployed backend.",
      html: "<p><strong>SMTP test successful</strong> from deployed backend.</p>",
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email send timeout (30s)")), 30000),
    );

    const info = await Promise.race([emailPromise, timeoutPromise]);

    return { ok: true, messageId: info.messageId, accepted: info.accepted };
  } catch (err) {
    return { ok: false, error: err.message, code: err.code };
  }
};

const sendOrderShippedEmail = async (order) => {
  try {
    if (!hasSmtpConfig()) return { ok: false, error: "Missing SMTP configuration" };
    const customerEmail = (order.customerDetails?.email || "").trim();
    if (!customerEmail) return { ok: false, error: "No customer email found" };

    const info = await sendMailWithRetry({
      from: `"UrbanDos" <${getFromAddress()}>`,
      to: customerEmail,
      subject: `📦 Your Order has Shipped! #${order._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #2980b9; text-transform: uppercase;">Your Order is on the Way! 🚀</h2>
          <p>Hi ${order.customerDetails.name},</p>
          <p>Great news! Your order <strong>#${order._id.toString().slice(-8)}</strong> has been shipped and is on its way to you.</p>
          <hr />
          <h3>Shipping to:</h3>
          <p>${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pinCode}</p>
          <hr />
          <p>Thank you for shopping with UrbanDos!</p>
        </div>
      `,
    }, "Order shipped");
    console.log(`[EMAIL] Shipped notification sent to: ${customerEmail}`);
    return { ok: true, accepted: info?.accepted || [], messageId: info?.messageId };
  } catch (error) {
    console.error("[EMAIL] Error sending order shipped email:", error.code || error.message);
    return { ok: false, error: error.code || error.message };
  }
};

const sendOrderDeliveredEmail = async (order) => {
  try {
    if (!hasSmtpConfig()) return { ok: false, error: "Missing SMTP configuration" };
    const customerEmail = (order.customerDetails?.email || "").trim();
    if (!customerEmail) return { ok: false, error: "No customer email found" };

    const info = await sendMailWithRetry({
      from: `"UrbanDos" <${getFromAddress()}>`,
      to: customerEmail,
      subject: `✅ Order Delivered! #${order._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #27ae60; text-transform: uppercase;">Order Delivered! 🎉</h2>
          <p>Hi ${order.customerDetails.name},</p>
          <p>Your order <strong>#${order._id.toString().slice(-8)}</strong> has been delivered successfully.</p>
          <p>We hope you love your purchase! If you have any questions, feel free to reach out.</p>
          <hr />
          <p>Thank you for shopping with UrbanDos! 🖤</p>
        </div>
      `,
    }, "Order delivered");
    console.log(`[EMAIL] Delivered notification sent to: ${customerEmail}`);
    return { ok: true, accepted: info?.accepted || [], messageId: info?.messageId };
  } catch (error) {
    console.error("[EMAIL] Error sending order delivered email:", error.code || error.message);
    return { ok: false, error: error.code || error.message };
  }
};

const sendOrderCancelledEmail = async (order) => {
  try {
    if (!hasSmtpConfig()) return { ok: false, error: "Missing SMTP configuration" };
    const customerEmail = (order.customerDetails?.email || "").trim();
    if (!customerEmail) return { ok: false, error: "No customer email found" };

    const info = await sendMailWithRetry({
      from: `"UrbanDos" <${getFromAddress()}>`,
      to: customerEmail,
      subject: `❌ Order Cancelled #${order._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #e74c3c; text-transform: uppercase;">Order Cancelled</h2>
          <p>Hi ${order.customerDetails.name},</p>
          <p>Your order <strong>#${order._id.toString().slice(-8)}</strong> (₹${order.totalAmount}) has been cancelled.</p>
          <p>If this was unexpected or you have any questions, please contact us directly.</p>
          <hr />
          <p>Thank you for your understanding. — UrbanDos</p>
        </div>
      `,
    }, "Order cancelled");
    console.log(`[EMAIL] Cancellation notification sent to: ${customerEmail}`);
    return { ok: true, accepted: info?.accepted || [], messageId: info?.messageId };
  } catch (error) {
    console.error("[EMAIL] Error sending order cancelled email:", error.code || error.message);
    return { ok: false, error: error.code || error.message };
  }
};

module.exports = {
  sendOrderInitiatedEmail,
  sendOrderReceivedEmail,
  sendUserClaimsPaidEmail,
  sendOrderConfirmedEmail,
  sendOrderDispatchedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  sendWhatsappAlert,
  verifyEmailConfig,
  sendTestEmail,
};
