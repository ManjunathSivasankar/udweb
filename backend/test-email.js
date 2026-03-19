require("dotenv").config();
const mongoose = require("mongoose");
const { sendOrderInitiatedAlert, sendOrderConfirmedEmail } = require("./services/notificationService");
const Order = require("./models/Order");

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the order I just created
    const order = await Order.findOne().sort({ createdAt: -1 });
    
    if (!order) {
      console.log("No order found");
      return;
    }
    
    console.log("Testing Order Initiated Email...");
    const res1 = await sendOrderInitiatedAlert(order);
    console.log("Initiated Result:", res1);
    
    console.log("Testing Order Confirmed Email...");
    const res2 = await sendOrderConfirmedEmail(order);
    console.log("Confirmed Result:", res2);
    
  } catch(err) {
    console.error("Script error:", err);
  } finally {
    mongoose.disconnect();
  }
}

test();
