const fs = require('fs');
const path = require('path');

const keys = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ADMIN_EMAIL',
  'EMAILJS_SERVICE_ID',
  'EMAILJS_TEMPLATE_ID',
  'EMAILJS_PUBLIC_KEY',
];

const env = {};
const missing = [];

for (const key of keys) {
  if (process.env[key]) {
    env[key] = process.env[key];
  } else {
    missing.push(key);
  }
}

const output = `window.ENV = ${JSON.stringify(env, null, 2)};\n`;
const outputPath = path.join(process.cwd(), 'env.js');
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Generated ${outputPath}`);
if (missing.length) {
  console.warn(`Warning: missing environment variables: ${missing.join(', ')}`);
}
