/**
 * Supabase Client Configuration
 * Sostituisci SUPABASE_URL e SUPABASE_ANON_KEY con le tue credenziali da supabase.com
 */
const SUPABASE_CONFIG = {
  url: window.ENV_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co',
  anonKey: window.ENV_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
};

// Inizializza client se configurato
let supabaseClient = null;
if (window.supabase && SUPABASE_CONFIG.url !== 'https://YOUR_PROJECT_ID.supabase.co') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('✓ Supabase connesso con successo.');
  } catch (err) {
    console.warn('Supabase non inizializzato, fallback locale:', err);
  }
}
