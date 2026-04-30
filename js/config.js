// js/config.js
// ============================================================
// ENVIRONMENT VARIABLES
// For local dev: env.js is loaded in index.html
// For Vercel: add these in Vercel Dashboard → Project → Settings → Environment Variables
// ============================================================

// Get config from window.ENV or window.ENV_<KEY> or fallback
const getEnvVar = (key, fallback) => {
  if (typeof window !== 'undefined') {
    if (window.ENV && window.ENV[key] !== undefined) return window.ENV[key];
    if (window[`ENV_${key}`] !== undefined) return window[`ENV_${key}`];
  }
  return fallback;
};

const CONFIG = {
  SUPABASE_URL: getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY'),
  ADMIN_EMAIL: getEnvVar('ADMIN_EMAIL'),
  EMAILJS_SERVICE_ID: getEnvVar('EMAILJS_SERVICE_ID'),
  EMAILJS_TEMPLATE_ID: getEnvVar('EMAILJS_TEMPLATE_ID'),
  EMAILJS_PUBLIC_KEY: getEnvVar('EMAILJS_PUBLIC_KEY'),
};

// Validate config
if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('your-project') ||
    !CONFIG.SUPABASE_ANON_KEY || CONFIG.SUPABASE_ANON_KEY.includes('your-')) {
  console.warn('⚠️ Please configure your Supabase credentials in env.js or Vercel environment variables');
}

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

export { CONFIG, supabaseClient };
