require("dotenv").config();

const getEnv = (key, fallback = "") => {
  const value = process.env[key];
  if (typeof value !== "string") return fallback;
  return value.trim().replace(/^["']|["']$/g, "");
};

const keysToCheck = [
  "BREVO_API_KEY",
  "BREVO_SMTP_KEY",
  "FROM_EMAIL",
  "ADMIN_EMAIL",
  "HEALTH_TOKEN"
];

const deprecatedKeys = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS"
];

console.log("--- Brevo API Environment Check ---");
keysToCheck.forEach(key => {
  const rawValue = process.env[key];
  const processedValue = getEnv(key);
  
  if (rawValue === undefined) {
    console.log(`${key}: [MISSING ❌]`);
  } else {
    const isSensitive = key.includes("KEY") || key.includes("TOKEN");
    const displayValue = isSensitive ? "********" : processedValue;
    console.log(`${key}: ${displayValue} (Raw length: ${rawValue.length}) [OK ✅]`);
    
    if (processedValue !== rawValue) {
      console.log(`  [INFO] ${key} had quotes or whitespace that were trimmed.`);
    }
  }
});

console.log("\n--- Deprecated SMTP Keys (No longer needed) ---");
deprecatedKeys.forEach(key => {
  if (process.env[key]) {
    console.log(`${key}: [PRESENT] (Safe to remove from Render)`);
  } else {
    console.log(`${key}: [ABSENT]`);
  }
});
console.log("----------------------------------");
