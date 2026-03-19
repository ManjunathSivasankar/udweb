require("dotenv").config();

const getEnv = (key, fallback = "") => {
  const value = process.env[key];
  if (typeof value !== "string") return fallback;
  return value.trim().replace(/^["']|["']$/g, "");
};

const keysToCheck = [
  "BREVO_SMTP_HOST",
  "BREVO_SMTP_PORT",
  "BREVO_SMTP_USER",
  "BREVO_SMTP_KEY",
  "BREVO_API_KEY",
  "SMTP_USER",
  "SMTP_PASS",
  "FROM_EMAIL",
  "ADMIN_EMAIL"
];

console.log("--- Environment Variable Check ---");
keysToCheck.forEach(key => {
  const rawValue = process.env[key];
  const processedValue = getEnv(key);
  
  if (rawValue === undefined) {
    console.log(`${key}: [UNDEFINED]`);
  } else {
    // Mask sensitive keys
    const isSensitive = key.includes("KEY") || key.includes("PASS") || key.includes("USER");
    const displayValue = isSensitive ? "********" : processedValue;
    console.log(`${key}: ${displayValue} (Raw length: ${rawValue.length})`);
    
    if (rawValue.startsWith('"') || rawValue.endsWith('"') || rawValue.startsWith("'") || rawValue.endsWith("'")) {
      console.log(`  [WARNING] ${key} has quotes in raw value! Handled by getEnv: ${processedValue === rawValue ? "NO" : "YES"}`);
    }
    if (rawValue.trim() !== rawValue) {
      console.log(`  [WARNING] ${key} has leading/trailing whitespace in raw value! Handled by getEnv: ${processedValue === rawValue ? "NO" : "YES"}`);
    }
  }
});
console.log("----------------------------------");
