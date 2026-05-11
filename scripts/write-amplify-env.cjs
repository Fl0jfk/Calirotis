/**
 * Appelé depuis amplify.yml en preBuild.
 * Copie les variables définies dans Amplify Console → Environment variables
 * vers .env.production.local pour que `next build` les charge (SSR / routes API).
 * Ne loggue jamais les valeurs.
 */
const fs = require("fs");

const names = [
  "BUCKET_NAME",
  "STORAGE_BUCKET",
  "S3_BUCKET_NAME",
  "REGION",
  "STORAGE_REGION",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "SECRET_ACCESS_KEY",
  "ADMIN_API_KEY",
  "NEXT_PUBLIC_ADMIN_API_KEY",
  "ADMIN_PASSWORD",
  "NEXT_PUBLIC_ADMIN_PASSWORD",
  "SMTP_USER",
  "SMTP_PASS",
  "NEXT_PUBLIC_SITE_URL",
];

const out = {};
for (const n of names) {
  const v = process.env[n];
  if (typeof v === "string" && v.trim()) out[n] = v;
}

if (process.env.ACCESS_KEY_ID && !out.AWS_ACCESS_KEY_ID) {
  out.AWS_ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
}
if (process.env.SECRET_ACCESS_KEY && !out.AWS_SECRET_ACCESS_KEY) {
  out.AWS_SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
}

const lines = Object.entries(out).map(([k, v]) => `${k}=${String(v).replace(/\r?\n/g, "\\n")}`);
fs.writeFileSync(".env.production.local", `${lines.join("\n")}\n`);
console.log(
  "[write-amplify-env] wrote .env.production.local with keys:",
  Object.keys(out).join(", ") || "(none — vérifie les variables Amplify)",
);
