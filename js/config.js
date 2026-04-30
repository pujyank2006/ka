// js/config.js
// ============================================================
// ENVIRONMENT VARIABLES
// For local dev: env.js is loaded in index.html
// For Vercel: a generated JS module is created during build
// ============================================================

// Get config from window.ENV or window.ENV_<KEY> or fallback
const getEnvVar = (key, fallback) => {
  if (typeof window !== 'undefined') {
    if (window.ENV && window.ENV[key] !== undefined) return window.ENV[key];
    if (window[`ENV_${key}`] !== undefined) return window[`ENV_${key}`];
  }
  return fallback;
};

let generatedConfig = {};
try {
  const module = await import('./generated-config.js');
  generatedConfig = module.GENERATED_CONFIG || {};
} catch (error) {
  generatedConfig = {};
}

const CONFIG = {
  SUPABASE_URL: generatedConfig.SUPABASE_URL ?? getEnvVar('SUPABASE_URL'),
  SUPABASE_ANON_KEY: generatedConfig.SUPABASE_ANON_KEY ?? getEnvVar('SUPABASE_ANON_KEY'),
  ADMIN_EMAIL: generatedConfig.ADMIN_EMAIL ?? getEnvVar('ADMIN_EMAIL'),
  EMAILJS_SERVICE_ID: generatedConfig.EMAILJS_SERVICE_ID ?? getEnvVar('EMAILJS_SERVICE_ID'),
  EMAILJS_TEMPLATE_ID: generatedConfig.EMAILJS_TEMPLATE_ID ?? getEnvVar('EMAILJS_TEMPLATE_ID'),
  EMAILJS_PUBLIC_KEY: generatedConfig.EMAILJS_PUBLIC_KEY ?? getEnvVar('EMAILJS_PUBLIC_KEY'),
};

// Validate config
if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL.includes('your-project') ||
    !CONFIG.SUPABASE_ANON_KEY || CONFIG.SUPABASE_ANON_KEY.includes('your-')) {
  console.warn('⚠️ Please configure your Supabase credentials in Vercel environment variables or local env.js');
}

// Initialize Supabase client
let supabaseClient = null;
if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
  const { createClient } = supabase;
  supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
} else {
  console.error('Supabase config is missing. Please provide SUPABASE_URL and SUPABASE_ANON_KEY via Vercel environment variables or local env.js.');
}

export { CONFIG, supabaseClient };
