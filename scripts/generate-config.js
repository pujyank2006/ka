const fs = require('fs');
const path = require('path');

const keys = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ADMIN_EMAIL'
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

const output = `export const GENERATED_CONFIG = ${JSON.stringify(env, null, 2)};\n`;
const outputPath = path.join(process.cwd(), 'js', 'generated-config.js');
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
if (missing.length) {
  console.warn(`Warning: missing environment variables: ${missing.join(', ')}`);
}
