const nodemailer = require("nodemailer");

/**
 * notificationService
 * Handles sending emails to the admin for order events.
 *
 * Requirements: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL in .env
 */

const getEnv = (key, fallback = "") => {
  const value = process.env[key];
  if (typeof value !== "string") return fallback;
  return value.trim().replace(/^["']|["']$/g, "");
};

const getSmtpPort = () => {
  const parsed = Number(getEnv("SMTP_PORT", "587"));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 587;
};

const createTransporter = () => {
  const smtpPort = getSmtpPort();
  // Gmail app passwords are commonly copied with spaces; remove them safely.
  const smtpPass = getEnv("SMTP_PASS").replace(/\s+/g, "");

  // Gmail: use the built-in service preset (port 465 SSL) which is
  // allowed on virtually all cloud hosting platforms.
  // Manual port 587 / requireTLS is frequently blocked by providers.
  const host = getEnv("SMTP_HOST").toLowerCase();
  const user = getEnv("SMTP_USER").toLowerCase();
  const isGmail = host.includes("gmail") || user.endsWith("@gmail.com");

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: getEnv("SMTP_USER"),
        pass: smtpPass,
      },
      tls: {
        servername: "smtp.gmail.com",
        rejectUnauthorized: false,
      },
      // Prefer IPv4 in hosted environments where IPv6 routes can stall.
      family: 4,
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 15000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 30000),
    });
  }

  return nodemailer.createTransport({
    host: getEnv("SMTP_HOST"),
    port: smtpPort,
    secure: smtpPort === 465,
    requireTLS: smtpPort === 587,
    auth: {
      user: getEnv("SMTP_USER"),
      pass: smtpPass,
    },
    tls: { rejectUnauthorized: false },
    family: 4, // Force IPv4 for generic SMTP as well to prevent routing issues
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 20000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 30000),
  });
};

const getTransporter = () => {
  // Always create a fresh transporter to avoid stale/broken cached connections.
  return createTransporter();
};

const hasSmtpConfig = () => {
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  const host = getEnv("SMTP_HOST");
  const isGmail = host.toLowerCase().includes("gmail") || user.toLowerCase().endsWith("@gmail.com");

  const missing = [];
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");
  // Host can be omitted for Gmail, but is required for other SMTP providers.
  if (!isGmail && !host) missing.push("SMTP_HOST");

  if (missing.length > 0) {
    console.warn(
      `[EMAIL] Missing SMTP environment variables: ${missing.join(", ")}. Email notifications are disabled.`,
    );
    return false;
  }

  return true;
};

const getFromAddress = () => {
  return getEnv("SMTP_FROM_EMAIL") || getEnv("SMTP_USER");
};

const sendMailWithRetry = async (mailOptions, label = "email") => {
  const maxAttempts = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const transporter = getTransporter();
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      lastError = error;
      const transientCodes = ["ETIMEDOUT", "ECONNECTION", "ESOCKET", "ECONNRESET"];
      const shouldRetry = transientCodes.includes(error?.code) && attempt < maxAttempts;
      console.error(
        `[EMAIL] ${label} send attempt ${attempt} failed:`,
        error?.code || error?.message,
      );
      if (!shouldRetry) break;
    }
  }

  throw lastError;
};

// Verify transporter on startup
const verifyConnection = async () => {
  if (!hasSmtpConfig()) return;

  const transporter = getTransporter();
  try {
    await transporter.verify();
    console.log("[EMAIL] SMTP server is ready to send messages");
    console.log(
      `[EMAIL] Config: host=${getEnv("SMTP_HOST") || "(auto)"} port=${getSmtpPort()} user=${getEnv("SMTP_USER")}`,
    );
  } catch (error) {
    console.error("[EMAIL] SMTP verification error:", error.message);
    console.error("[EMAIL] Error code:", error.code);
    console.error(
      `[EMAIL] Config: host=${getEnv("SMTP_HOST") || "(auto)"} port=${getSmtpPort()} user=${getEnv("SMTP_USER")} passSet=${!!getEnv("SMTP_PASS")}`,
    );
    console.error(
      "[EMAIL] Check deployment env vars, SMTP credentials, firewall/port access, and provider security settings.",
    );
  }
};
verifyConnection();

const sendWhatsappAlert = async (message) => {
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
