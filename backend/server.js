const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const admin = require("firebase-admin");

dotenv.config();
const app = express();

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    const saPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./ServiceAccountKey.json";
    const saFullPath = require("path").resolve(saPath);

    if (require("fs").existsSync(saFullPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(require(saFullPath)),
      });
      console.log("🔥 Firebase Admin Initialized (Key File)");
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      admin.initializeApp({
        credential: admin.credential.cert(
          JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON),
        ),
      });
      console.log("🔥 Firebase Admin Initialized (Env Variable)");
    } else {
      console.warn("⚠️ Firebase Admin NOT Initialized (No credentials found)");
    }
  } catch (error) {
    if (error.code === "app/duplicate-app") {
      console.log("🔥 Firebase Admin already initialized (re-use)");
    } else {
      console.error("❌ Firebase Initialization Error:", error.message);
    }
  }
}

const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : ["http://localhost:5173", "http://localhost:3000"];

const normalizeOrigin = (value) => {
  if (!value) return "";
  return value.trim().replace(/\/+$/, "");
};

const allowedOrigins = new Set(configuredOrigins.map(normalizeOrigin));

const netlifySites = configuredOrigins
  .map((origin) => {
    try {
      const { hostname, protocol } = new URL(origin);
      if (!hostname.endsWith(".netlify.app")) return null;
      const siteName = hostname.split(".")[0];
      return { siteName, protocol };
    } catch {
      return null;
    }
  })
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.has(normalizedOrigin)) return true;

  try {
    const { hostname, protocol } = new URL(normalizedOrigin);

    // Always allow local frontend dev servers.
    if (
      protocol === "http:" &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    ) {
      return true;
    }

    // Allow Netlify deploy-preview/branch subdomains for configured sites.
    for (const site of netlifySites) {
      if (protocol !== site.protocol) continue;
      if (hostname === `${site.siteName}.netlify.app`) return true;
      if (hostname.endsWith(`--${site.siteName}.netlify.app`)) return true;
    }
  } catch {
    return false;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/collections", require("./routes/collectionRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

app.get("/", (req, res) => res.send("API Regular"));

// GET /api/health/email  – diagnose SMTP config from production
app.get("/api/health/email", async (req, res) => {
  try {
    const token = req.query.token || req.headers["x-health-token"];
    if (!process.env.HEALTH_TOKEN || token !== process.env.HEALTH_TOKEN) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const { verifyEmailConfig } = require("./services/notificationService");
    const result = await verifyEmailConfig();
    res.status(result.ok ? 200 : 500).json(result);
  } catch (error) {
    console.error("[HEALTH CHECK ERROR]:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// POST /api/health/email/test?token=...&to=...  – send test email from production
app.post("/api/health/email/test", async (req, res) => {
  try {
    const token = req.query.token || req.headers["x-health-token"];
    if (!process.env.HEALTH_TOKEN || token !== process.env.HEALTH_TOKEN) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const to = req.query.to || req.body?.to;
    if (!to) {
      return res.status(400).json({ ok: false, error: "Recipient email (to) is required" });
    }

    const { sendTestEmail } = require("./services/notificationService");
    const result = await sendTestEmail(to);
    res.status(result.ok ? 200 : 500).json(result);
  } catch (error) {
    console.error("[TEST EMAIL ERROR]:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("running"));
