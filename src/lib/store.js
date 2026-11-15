// DATA STORE
// Same functions whether data lives in Supabase (cloud) or localStorage (this browser only).
// Components never talk to the database directly; they call these functions.

import { supabase, ensureUser } from './supabase.js';

const LS = {
  get: (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(`rasoi:${k}`)) ?? fallback; } catch { return fallback; }
  },
  set: (k, v) => {
    try { localStorage.setItem(`rasoi:${k}`, JSON.stringify(v)); } catch { /* storage full or blocked */ }
  },
};

export const DEFAULT_PROFILE = {
  name: '', diet: 'none', allergies: [], conditions: [], avoid: [], doctorNotes: '', consent: false,
};

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

// ---------- profile ----------
export async function loadProfile() {
  if (!supabase) return LS.get('profile', DEFAULT_PROFILE);
  const user = await ensureUser();
  const { data } = await supabase.from('profiles').select('data').eq('id', user.id).maybeSingle();
  return { ...DEFAULT_PROFILE, ...(data?.data || {}) };
}

export async function saveProfile(profile) {
  if (!supabase) return LS.set('profile', profile);
  const user = await ensureUser();
  await supabase.from('profiles').upsert({ id: user.id, data: profile, updated_at: new Date().toISOString() });
}

// ---------- inventory ----------
export async function loadInventory() {
  if (!supabase) return LS.get('inventory', []);
  await ensureUser();
  const { data } = await supabase.from('inventory_items').select('id,name,qty,expiry').order('expiry');
  return data || [];
}

export async function addItems(items) {
  const rows = items.map((i) => ({ id: newId(), ...i }));
  if (!supabase) {
    LS.set('inventory', [...LS.get('inventory', []), ...rows]);
    return rows;
  }
  const user = await ensureUser();
  const { data } = await supabase.from('inventory_items').insert(rows.map((r) => ({ ...r, user_id: user.id }))).select('id,name,qty,expiry');
  return data || rows;
}

export async function updateItem(id, changes) {
  if (!supabase) return LS.set('inventory', LS.get('inventory', []).map((i) => (i.id === id ? { ...i, ...changes } : i)));
  await supabase.from('inventory_items').update(changes).eq('id', id);
}

export async function removeItem(id) {
  if (!supabase) return LS.set('inventory', LS.get('inventory', []).filter((i) => i.id !== id));
  await supabase.from('inventory_items').delete().eq('id', id);
}

// ---------- rescue log ----------
export async function loadRescueLog() {
  if (!supabase) return LS.get('rescue', []);
  await ensureUser();
  const { data } = await supabase.from('rescue_log').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function addRescueEntry(entry) {
  const row = { id: newId(), created_at: new Date().toISOString(), ...entry };
  if (!supabase) {
    LS.set('rescue', [row, ...LS.get('rescue', [])]);
    return row;
  }
  const user = await ensureUser();
  await supabase.from('rescue_log').insert({ ...row, user_id: user.id });
  return row;
}

export function resetLocalData() {
  ['profile', 'inventory', 'rescue'].forEach((k) => localStorage.removeItem(`rasoi:${k}`));
}
