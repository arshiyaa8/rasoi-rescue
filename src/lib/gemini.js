// GEMINI AI  (vision + recipe reasoning)
// Two jobs:
//   1. detectIngredients(photo)  -> ["potato", "spinach", ...]
//   2. generateRecipes(...)      -> recipes written by the AI
// Whatever comes back is NOT trusted: the app normalises names and runs the safety check on it.
//
// How the call is made:
//   - Production: through the Supabase Edge Function "gemini" (key stays secret on the server)
//   - Local testing: directly with VITE_GEMINI_API_KEY
//   - Demo mode (no keys): returns sample data so a live demo never breaks

import { config, DEMO, hasSupabase } from './config.js';
import { supabase } from './supabase.js';

async function callGemini(parts) {
  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
  };

  let data;
  if (hasSupabase && config.useEdgeFunction) {
    const { data: d, error } = await supabase.functions.invoke('gemini', { body });
    if (error) throw error;
    data = d;
  } else {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.geminiKey },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    data = await res.json();
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  return JSON.parse(text.replace(/^```json|```$/g, '').trim());
}

// Converts a File from <input type="file"> into base64 for Gemini.
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function detectIngredients(file) {
  if (DEMO) {
    await wait(900);
    return ['potato', 'spinach', 'tomato', 'onion', 'peas', 'curd', 'peanut'];
  }
  const data = await fileToBase64(file);
  const prompt = `You are looking at a photo of a fridge, kitchen shelf or groceries in an Indian home.
List every distinct food ingredient you can clearly see. Use simple English names in singular form
(e.g. "potato", "spinach", "paneer"). Do not guess hidden items. Ignore packaging brands.
Return JSON: {"ingredients": ["name", ...]}`;
  const out = await callGemini([{ text: prompt }, { inline_data: { mime_type: file.type || 'image/jpeg', data } }]);
  return Array.isArray(out) ? out : out.ingredients || [];
}

export async function generateRecipes({ safeIngredients, useFirst, profile, candidateTitles }) {
  if (DEMO) {
    await wait(1200);
    // Sample "AI output" including one unsafe recipe, so the demo can show the safety check catching it.
    return [
      {
        title: 'Aloo Palak Tikki with Curd Dip', time: 25, servings: 2, source: 'Gemini (demo)',
        ingredients: [{ name: 'potato', qty: 250 }, { name: 'spinach', qty: 150 }, { name: 'onion', qty: 50 }, { name: 'curd', qty: 100 }],
        steps: ['Boil and mash the potato.', 'Wilt the chopped spinach in a pan and squeeze dry.', 'Mix potato, spinach, onion, salt and cumin; shape small tikkis.', 'Shallow fry on a tawa with little oil until golden.', 'Serve with curd mixed with salt and roasted cumin.'],
        nutrition: { kcal: 210, protein: 7, carbs: 30 },
        why: 'Uses the spinach before it wilts; curd adds protein, which helps balance the potato.',
      },
      {
        title: 'Spinach Peas Stir-fry with Groundnut Crunch', time: 15, servings: 2, source: 'Gemini (demo)',
        ingredients: [{ name: 'spinach', qty: 200 }, { name: 'peas', qty: 100 }, { name: 'tomato', qty: 80 }],
        steps: ['Sauté the peas and tomato in oil with cumin.', 'Add the spinach and cook 3 minutes.', 'Top with roasted crushed groundnuts.'],
        nutrition: { kcal: 160, protein: 8, carbs: 15 },
        why: 'Quick, low-carb way to use leafy greens.',
      },
    ];
  }

  const prompt = `You are Rasoi Rescue, a home-cooking assistant for Indian households.
Create 3 simple home-style recipes using ONLY these available ingredients plus common staples
(salt, oil, water, turmeric, chilli powder, cumin, mustard seeds, garam masala, hing):
${safeIngredients.join(', ')}

Use these first because they expire soon: ${useFirst.join(', ') || 'none'}
Diet: ${profile.diet || 'none'}. Allergies (NEVER use, not even as garnish or oil): ${(profile.allergies || []).join(', ') || 'none'}.
Avoid: ${(profile.avoid || []).join(', ') || 'none'}.
Health considerations: ${(profile.conditions || []).join(', ') || 'none'} - follow general healthy-eating guidance only, no medical claims.
Do not repeat these existing recipes: ${candidateTitles.join(', ')}.

Return JSON: {"recipes":[{"title":"","time":minutes,"servings":n,
"ingredients":[{"name":"","qty":grams}],"steps":[""],
"nutrition":{"kcal":n,"protein":grams,"carbs":grams},"why":"one sentence on why it suits this user"}]}`;
  const out = await callGemini([{ text: prompt }]);
  return (out.recipes || out || []).map((r) => ({ ...r, source: 'Gemini' }));
}
