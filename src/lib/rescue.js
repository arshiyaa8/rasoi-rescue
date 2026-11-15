// RESCUE SCORE
// When you cook a recipe, we work out how much of your inventory it used up.
//
//   Food rescued (kg) = grams used of items that had 3 days or less left, / 1000
//   Money saved (Rs)  = for each rescued item: kg used x approx price per kg
//
// Only near-expiry food counts as "rescued", because that is the food that was likely
// to be thrown away. Food with plenty of shelf life counts as "used" but not "rescued".

import { canonicalName, daysLeft, findIngredient } from './ingredients.js';

export const RESCUE_WINDOW_DAYS = 3;

export function cookRecipe(recipe, inventory, today = new Date()) {
  const byName = new Map(inventory.map((i) => [canonicalName(i.name), i]));
  const updates = []; // { id, qty } or { id, remove: true }
  const items = [];

  for (const ing of recipe.ingredients) {
    const inv = byName.get(canonicalName(ing.name));
    if (!inv) continue;
    const need = Number(ing.qty) || 100;
    const available = Number(inv.qty) || need; // unknown qty -> assume the recipe uses it all
    const used = Math.min(need, available);
    const left = available - used;
    updates.push(left > 10 ? { id: inv.id, qty: Math.round(left) } : { id: inv.id, remove: true });

    const rescued = daysLeft(inv.expiry, today) <= RESCUE_WINDOW_DAYS;
    const price = findIngredient(inv.name)?.price || 80;
    items.push({ name: canonicalName(inv.name), grams: used, rescued, value: rescued ? Math.round((used / 1000) * price) : 0 });
  }

  const rescuedGrams = items.filter((i) => i.rescued).reduce((s, i) => s + i.grams, 0);
  const entry = {
    recipe_title: recipe.title,
    kg_used: +(items.reduce((s, i) => s + i.grams, 0) / 1000).toFixed(2),
    kg_rescued: +(rescuedGrams / 1000).toFixed(2),
    money_saved: items.reduce((s, i) => s + i.value, 0),
    items,
  };
  return { updates, entry };
}

export function totals(log) {
  return log.reduce(
    (t, e) => ({
      meals: t.meals + 1,
      kgRescued: +(t.kgRescued + Number(e.kg_rescued)).toFixed(2),
      kgUsed: +(t.kgUsed + Number(e.kg_used)).toFixed(2),
      money: t.money + Number(e.money_saved),
    }),
    { meals: 0, kgRescued: 0, kgUsed: 0, money: 0 },
  );
}
