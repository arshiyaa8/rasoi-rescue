// RECIPEDB ADAPTER
// Fetches real recipes from RecipeDB when VITE_RECIPEDB_URL is set, and converts them
// into the same shape as LOCAL_RECIPES so the matcher and safety engine work unchanged.
//
// IMPORTANT: check the exact endpoint, query parameter and field names in the
// RecipeDB API docs given by the hackathon, then edit the 3 marked lines below.
// If the call fails for any reason, the app silently falls back to the local recipes.

import { config } from './config.js';
import { LOCAL_RECIPES } from './recipes.js';

export async function getCandidateRecipes(ingredientNames) {
  if (!config.recipeDbUrl) return LOCAL_RECIPES;
  try {
    const url = new URL(config.recipeDbUrl);
    url.searchParams.set('ingredients', ingredientNames.join(',')); // (1) query param name
    const res = await fetch(url, {
      headers: config.recipeDbKey ? { Authorization: `Bearer ${config.recipeDbKey}` } : {}, // (2) auth header
    });
    if (!res.ok) throw new Error(`RecipeDB ${res.status}`);
    const data = await res.json();
    const rows = Array.isArray(data) ? data : data.data || data.recipes || data.payload?.data || [];
    const remote = rows.slice(0, 30).map(toLocalShape).filter((r) => r.ingredients.length);
    return [...remote, ...LOCAL_RECIPES];
  } catch (err) {
    console.warn('RecipeDB unavailable, using local recipes:', err.message);
    return LOCAL_RECIPES;
  }
}

// (3) map RecipeDB field names -> our shape
function toLocalShape(r) {
  const ingredients = (r.ingredients || r.ingredient_list || [])
    .map((i) => (typeof i === 'string' ? { name: i, qty: 100 } : { name: i.ingredient || i.name, qty: Number(i.quantity_g || i.qty) || 100 }))
    .filter((i) => i.name);
  const steps = r.instructions || r.steps || r.processes || [];
  return {
    id: `rdb-${r.Recipe_id || r.recipe_id || r.id}`,
    title: r.Recipe_title || r.recipe_title || r.title || 'RecipeDB recipe',
    time: Number(r.total_time || r.time) || 30,
    servings: Number(r.servings) || 2,
    ingredients,
    steps: Array.isArray(steps) ? steps : String(steps).split(/\.\s+|\|/).filter(Boolean),
    nutrition: { kcal: Number(r.Calories || r.calories) || null, protein: Number(r['Protein (g)'] || r.protein) || null, carbs: Number(r['Carbohydrate, by difference (g)'] || r.carbs) || null },
    source: 'RecipeDB',
  };
}
