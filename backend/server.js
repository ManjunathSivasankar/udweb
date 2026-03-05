const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

// Express App
const app = express();
app.use(cors());
app.use(express.json());

// Prevent browser caching for all API routes
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Routes
const productRoutes = require("./routes/productRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");

app.use("/api/products", productRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/testimonials", testimonialRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("API is running... MongoDB connection test.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
