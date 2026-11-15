// SUPABASE CLIENT
// Created only when URL + anon key are in .env. Otherwise null and the app uses localStorage.
import { createClient } from '@supabase/supabase-js';
import { config, hasSupabase } from './config.js';

export const supabase = hasSupabase ? createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

// Anonymous sign-in gives each device its own user id without a login screen.
// Enable it in Supabase: Authentication -> Sign In / Providers -> Anonymous sign-ins.
export async function ensureUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;
  const { data: signIn, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return signIn.user;
}
