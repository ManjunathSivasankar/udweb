const nodemailer = require("nodemailer");
const path = require("path");

const getEnv = (key, fallback = "") => {
  const value = process.env[key];
  if (typeof value !== "string") return fallback;
  return value.trim().replace(/^["']|["']$/g, "");
};

const SMTP_HOST = getEnv("SMTP_HOST", "smtp.gmail.com");
const SMTP_PORT = parseInt(getEnv("SMTP_PORT", "587")); // Default to 587 for Render/ISP compatibility
const SMTP_USER = getEnv("SMTP_USER");
const SMTP_PASS = getEnv("SMTP_PASS");
const FROM_EMAIL = getEnv("SMTP_FROM_EMAIL") || SMTP_USER;
const ADMIN_EMAIL = getEnv("ADMIN_EMAIL") || "urbandos7@gmail.com"; // Matches .env

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true, // Port 587 should be secure: false
  family: 4, // Force IPv4 to avoid ENETUNREACH errors on Render
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const sendEmail = async (mailOptions, retries = 3) => {
  const options = {
    from: `"UrbanDos" <${FROM_EMAIL}>`,
    to: mailOptions.to,
    subject: mailOptions.subject,
    text: mailOptions.text,
    html: mailOptions.html,
    attachments: mailOptions.attachments || [],
  };

  for (let i = 0; i < retries; i++) {
    try {
      const info = await transporter.sendMail(options);
      console.log("[EMAIL SUCCESS]:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`[EMAIL ATTEMPT ${i + 1} FAILED]:`, error.code, error.message);
      
      if (i < retries - 1) {
        console.log(`Retrying in 2 seconds...`);
        await delay(2000);
        continue;
      }
      
      // On absolute failure, log but don't crash background jobs
      return { success: false, error: error.message, code: error.code };
    }
  }
};

const sendStatusUpdateEmail = async (order, customerEmail, status) => {
  const emailBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #000; color: #fff; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">UrbanDos</h1>
      </div>
      
      <div style="padding: 30px; background-color: #fff;">
        <h2 style="color: #000; margin-top: 0;">Order Update</h2>
        <p>Hello <strong>${order.customerDetails.name}</strong>,</p>
        <p>The status of your order <strong>#${order.orderId || order._id}</strong> has been updated:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 5px solid #000; display: flex; align-items: center;">
          <div style="font-size: 14px; color: #666; margin-right: 15px;">NEW STATUS:</div>
          <div style="font-size: 20px; font-weight: bold; color: #000; text-transform: uppercase;">${status}</div>
        </div>
        
        <p>You can track your order history and details in your profile.</p>
        
        <div style="margin: 35px 0; text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">VIEW ORDER STATUS</a>
        </div>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #888;">
        <p style="margin: 0;">Stay Sharp. Stay Bold. Stay Urban.</p>
        <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} UrbanDos. All rights reserved.</p>
      </div>
    </div>
  `;
  await sendEmail({ to: customerEmail, subject: `Order Status Update: #${order.orderId || order._id}`, html: emailBody });
};

module.exports = {
  verifyEmailConfig: async () => {
    try { await transporter.verify(); return { ok: true }; }
    catch (e) { return { ok: false, error: e.message }; }
  },
  sendOrderInitiatedAlert: async (order) => {
    let attachments = [];
    let screenshotHtml = "";
    if (order.paymentScreenshot) {
      // Look for upload in two places just in case - the path stored in DB might be relative to uploads or to root
      // Usually it's /uploads/payments/filename
      const relativePath = order.paymentScreenshot.startsWith("/") ? order.paymentScreenshot.substring(1) : order.paymentScreenshot;
      const filePath = path.join(process.cwd(), relativePath);
      
      attachments.push({
        filename: "payment_proof.jpg",
        path: filePath,
        cid: "proof"
      });
      screenshotHtml = `
        <div style="margin-top:20px; border: 2px dashed #e0e0e0; padding: 15px; border-radius: 8px;">
          <p style="font-weight: bold; color: #d32f2f;">📸 CUSTOMER PAYMENT PROOF:</p>
          <img src="cid:proof" style="max-width:400px; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.1)"/>
          <p style="font-size: 11px; color: #888; margin-top: 10px;">File path for debugging: ${filePath}</p>
        </div>
      `;
    }
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
        <h1 style="color: #d32f2f; border-bottom: 2px solid #eee; padding-bottom: 10px; font-size: 20px;">🚨 URGENT: NEW ORDER RECEIVED</h1>
        
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 6px;">
          <p><strong>Order ID:</strong> <span style="font-family: monospace; font-size: 16px;">#${order._id}</span></p>
          <p><strong>Total Amount:</strong> <span style="color: #2e7d32; font-weight: bold; font-size: 18px;">₹${order.totalAmount}</span></p>
          <p><strong>Customer:</strong> ${order.customerDetails.name} (${order.customerDetails.email})</p>
          <p><strong>Phone:</strong> ${order.customerDetails.phone}</p>
          <p><strong>Shipping:</strong> ${order.shippingMethod}</p>
        </div>

        <div style="margin: 20px 0;">
          <p><strong>Address:</strong><br/>
          ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}</p>
        </div>

        ${screenshotHtml}
        
        <div style="margin-top: 30px; text-align: center;">
          <p style="font-size: 12px; color: #999;">UrbanDos Automated Order System</p>
        </div>
      </div>
    `;
    await sendEmail({ to: ADMIN_EMAIL, subject: `🚨 NEW ORDER: ₹${order.totalAmount} - #${order._id.toString().slice(-6)}`, html, attachments });
  },
  sendOrderReceivedEmail: async (order, email) => {
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; color: #fff; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">UrbanDos</h1>
        </div>
        
        <div style="padding: 30px; background-color: #fff;">
          <h2 style="color: #000; margin-top: 0; text-align: center;">WE'VE RECEIVED YOUR ORDER!</h2>
          <p>Hello <strong>${order.customerDetails.name}</strong>,</p>
          <p>Thank you for shopping with UrbanDos. Your style statement is on its way to reality. Your order is currently undergoing payment verification.</p>
          
          <div style="margin: 25px 0; padding: 20px; border: 1px solid #eee; border-radius: 6px;">
            <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> #${order._id}</p>
            <p style="margin: 0 0 10px 0;"><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
            <p style="margin: 0;"><strong>Current Status:</strong> <span style="color: #f57c00; font-weight: bold;">Order Placed</span></p>
          </div>

          <p>Once our team verifies the payment, you'll receive another update when your gear has been confirmed for processing.</p>
          
          <div style="margin: 35px 0; text-align: center;">
             <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/profile" style="background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">TRACK YOUR ORDER</a>
          </div>

          <p style="font-style: italic; font-size: 14px; text-align: center; color: #666;">"Style is a way to say who you are without having to speak."</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <p style="margin: 0;">Stay Sharp. Stay Bold. Stay Urban.</p>
          <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} UrbanDos. All rights reserved.</p>
        </div>
      </div>
    `;
    await sendEmail({ to: email, subject: `UrbanDos - Order Received! (#${order._id.toString().slice(-6)})`, html });
  },
  sendStatusUpdateEmail,
  sendOrderConfirmedEmail: (o) => sendStatusUpdateEmail(o, o.customerDetails.email, "Confirmed"),
  sendOrderDispatchedEmail: (o) => sendStatusUpdateEmail(o, o.customerDetails.email, "Dispatched"),
  sendOrderShippedEmail: (o) => sendStatusUpdateEmail(o, o.customerDetails.email, "Shipped"),
  sendOrderDeliveredEmail: (o) => sendStatusUpdateEmail(o, o.customerDetails.email, "Delivered"),
  sendOrderCancelledEmail: (o) => sendStatusUpdateEmail(o, o.customerDetails.email, "Cancelled"),
  sendUserClaimsPaidEmail: async (order) => {
    return await sendEmail({
      to: ADMIN_EMAIL,
      subject: `✅ Payment Claimed - Order #${order._id}`,
      text: `Customer ${order.customerDetails.name} has marked payment as completed.`
    });
  },
  sendWhatsappAlert: async (message) => { console.log("[WA-MOCK]:", message); }
};