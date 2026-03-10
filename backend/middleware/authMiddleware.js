const admin = require("firebase-admin");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("🔒 Auth: No token provided in header");
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

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

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
  } catch {
    // Token invalid or Firebase Admin not initialised — treat as guest
    req.user = null;
  }

  next();
};

module.exports = { verifyToken, optionalVerifyToken };
