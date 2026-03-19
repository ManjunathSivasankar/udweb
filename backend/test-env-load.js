require("dotenv").config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

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

console.log("--- Brevo API Environment Check ---");
const envValues = {};
keysToCheck.forEach(key => {
  const rawValue = process.env[key];
  const processedValue = getEnv(key);
  envValues[key] = processedValue;
  
  if (rawValue === undefined) {
    console.log(`${key}: [MISSING ❌]`);
  } else {
    const isSensitive = key.includes("KEY") || key.includes("TOKEN");
    const displayValue = isSensitive 
      ? (processedValue.substring(0, 8) + "..." + processedValue.substring(processedValue.length - 4)) 
      : processedValue;
    
    console.log(`${key}: ${displayValue} (Length: ${processedValue.length}) [OK ✅]`);
    
    if (isSensitive && !processedValue.startsWith("xkeysib-") && key.includes("API_KEY")) {
      console.log(`  [WARNING] ${key} does not start with 'xkeysib-'!`);
    }
    if (processedValue !== rawValue) {
      console.log(`  [INFO] ${key} had quotes or whitespace that were trimmed.`);
    }
  }
});

const API_KEY = envValues["BREVO_API_KEY"] || envValues["BREVO_SMTP_KEY"];

if (API_KEY) {
  console.log("\n--- Testing API Connectivity ---");
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = API_KEY;

  const accountApi = new SibApiV3Sdk.AccountApi();

  accountApi.getAccount().then(data => {
    console.log("[SUCCESS ✅] Brevo API Key is authorized.");
    console.log("Account Email:", data.email);
    console.log("Plan Type:", data.plan.map(p => p.type).join(", "));
  }).catch(error => {
    console.error("[FAILURE ❌] Brevo API Key is NOT authorized.");
    if (error.response && error.response.body) {
      console.error("Error Code:", error.response.body.code);
      console.error("Error Message:", error.response.body.message);
    } else {
      console.error("Error:", error.message);
    }
  });
} else {
  console.log("\n[SKIPPED] Cannot test connectivity without an API key.");
}
