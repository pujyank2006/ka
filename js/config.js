import { GENERATED_CONFIG } from './generated-config.js';

const CONFIG = {
  SUPABASE_URL: GENERATED_CONFIG.SUPABASE_URL,
  SUPABASE_ANON_KEY: GENERATED_CONFIG.SUPABASE_ANON_KEY,
  ADMIN_EMAIL: GENERATED_CONFIG.ADMIN_EMAIL,
};

// Validate config
if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
  console.error('Supabase config is missing. Provide SUPABASE_URL and SUPABASE_ANON_KEY via Vercel environment variables.');
}

// Access supabase from global scope (loaded via CDN in HTML)
const { createClient } = window.supabase;
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);


export { CONFIG, supabaseClient };
