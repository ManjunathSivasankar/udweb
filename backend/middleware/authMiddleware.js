const admin = require("firebase-admin");

/**
 * Decode a Firebase JWT payload WITHOUT signature verification.
 * Used as a fallback when Firebase Admin SDK is not initialized (e.g. local dev
 * without a ServiceAccountKey.json). Do NOT use this in production.
 */
const decodeTokenUnsafe = (token) => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return { uid: decoded.user_id || decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
};

const isFirebaseInitialized = () => {
  try {
    return admin.apps.length > 0;
  } catch {
    return false;
  }
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("🔒 Auth: No token provided in header");
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // Firebase Admin not initialized (e.g. no ServiceAccountKey.json on local dev)
  // Fall back to unsafe JWT decode so dev work is not blocked.
  if (!isFirebaseInitialized()) {
    const decoded = decodeTokenUnsafe(token);
    if (decoded?.uid) {
      console.warn("⚠️  Auth: Firebase Admin NOT initialized. Using unsafe JWT decode (dev-only fallback).");
      req.user = decoded;
      return next();
    }
    return res.status(401).json({ message: "Unauthorized - Firebase not initialized and token malformed" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // contains uid, email, etc.
    next();
  } catch (error) {
    console.error(
      "🔒 Auth: Token verification failed. Error Code:",
      error.code,
    );
    console.error("🔒 Auth: Error Message:", error.message);

    // Help the user: If they see 'app/not-initialized', it means Firebase Admin is broken.
    // If they see 'auth/argument-error', it's a malformed token.
    return res.status(401).json({
      message: "Unauthorized - Invalid or expired token",
      error: error.code,
    });
  }
};

// Optional auth: sets req.user if a valid token is present,
// but allows the request through as a guest if not.
// Used for routes like payment initiation where guests can also checkout.
const optionalVerifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null; // no token — treat as guest
    return next();
  }

  const token = authHeader.split(" ")[1];

  // Fallback for local dev without ServiceAccountKey.json
  if (!isFirebaseInitialized()) {
    const decoded = decodeTokenUnsafe(token);
    req.user = decoded; // will be null if malformed, which is fine for optional auth
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
  } catch {
    // Token invalid or verification failed — treat as guest
    req.user = null;
  }

  next();
};

module.exports = { verifyToken, optionalVerifyToken };
