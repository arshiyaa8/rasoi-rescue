// Reads settings from the .env file. Vite only exposes variables that start with VITE_.
const env = import.meta.env;

export const config = {
  supabaseUrl: env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || '',
  useEdgeFunction: env.VITE_USE_EDGE_FUNCTION === 'true',
  geminiKey: env.VITE_GEMINI_API_KEY || '',
  geminiModel: env.VITE_GEMINI_MODEL || 'gemini-2.5-flash',
  recipeDbUrl: env.VITE_RECIPEDB_URL || '',
  recipeDbKey: env.VITE_RECIPEDB_KEY || '',
};

export const hasSupabase = Boolean(config.supabaseUrl && config.supabaseAnonKey);
// AI is available either through the secure edge function or a local dev key.
export const hasAI = (hasSupabase && config.useEdgeFunction) || Boolean(config.geminiKey);
// Demo mode: no AI configured, so the app uses built-in sample data instead.
export const DEMO = !hasAI;
