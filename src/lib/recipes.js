// LOCAL RECIPE DATA + MATCHING
// A small built-in set of Indian home recipes, so the app works with no internet.
// It is shaped like RecipeDB data, so real RecipeDB results can be mixed in (see recipedb.js).
// qty is in grams. Staples (salt, oil, spices, water) are assumed and not listed.
// Nutrition values are rough per-serving estimates for a prototype.

import { canonicalName, daysLeft, findIngredient, SWAPS } from './ingredients.js';
import { checkIngredient, checkRecipe } from './safety.js';

export const LOCAL_RECIPES = [
  {
    id: 'aloo-palak', title: 'Aloo Palak', time: 30, servings: 3,
    ingredients: [{ name: 'potato', qty: 300 }, { name: 'spinach', qty: 250 }, { name: 'onion', qty: 100 }, { name: 'tomato', qty: 100 }, { name: 'garlic', qty: 10 }, { name: 'green chilli', qty: 5 }],
    steps: ['Wash and chop the spinach. Peel and cube the potato.', 'Heat oil, add cumin, then the chopped onion and garlic. Cook until golden.', 'Add tomato, turmeric, chilli powder and salt. Cook until soft.', 'Add potato with a splash of water. Cover and cook 10 minutes.', 'Add spinach and green chilli. Cook uncovered 5 minutes until the potato is tender.'],
    nutrition: { kcal: 190, protein: 5, carbs: 30 },
  },
  {
    id: 'palak-dal', title: 'Palak Moong Dal', time: 30, servings: 3,
    ingredients: [{ name: 'moong dal', qty: 150 }, { name: 'spinach', qty: 150 }, { name: 'tomato', qty: 100 }, { name: 'onion', qty: 80 }, { name: 'garlic', qty: 10 }],
    steps: ['Rinse the dal and pressure cook with turmeric and 3 cups of water for 2 whistles.', 'Heat oil, add cumin, garlic and onion; fry until light brown.', 'Add tomato and cook until soft, then add chopped spinach.', 'Pour in the cooked dal, add salt and simmer 5 minutes.'],
    nutrition: { kcal: 210, protein: 13, carbs: 32 },
  },
  {
    id: 'poha', title: 'Kanda Poha', time: 20, servings: 2,
    ingredients: [{ name: 'poha', qty: 150 }, { name: 'onion', qty: 80 }, { name: 'peas', qty: 50 }, { name: 'peanut', qty: 25 }, { name: 'lemon', qty: 20 }, { name: 'coriander', qty: 10 }, { name: 'green chilli', qty: 5 }],
    steps: ['Rinse the poha in a strainer and let it soften for 5 minutes.', 'Heat oil, add mustard seeds and fry the peanut until crunchy.', 'Add onion, green chilli and peas; cook 3 minutes.', 'Add turmeric, salt and the poha. Mix gently and cook 2 minutes.', 'Finish with lemon juice and coriander.'],
    nutrition: { kcal: 280, protein: 7, carbs: 45 },
  },
  {
    id: 'besan-chilla', title: 'Besan Chilla', time: 20, servings: 2,
    ingredients: [{ name: 'besan', qty: 150 }, { name: 'onion', qty: 60 }, { name: 'tomato', qty: 60 }, { name: 'green chilli', qty: 5 }, { name: 'coriander', qty: 10 }],
    steps: ['Mix besan with salt, turmeric and water into a smooth pouring batter.', 'Stir in finely chopped onion, tomato, green chilli and coriander.', 'Pour a ladle on a hot greased tawa and spread thin.', 'Cook both sides until golden. Repeat.'],
    nutrition: { kcal: 230, protein: 12, carbs: 30 },
  },
  {
    id: 'upma', title: 'Vegetable Upma', time: 20, servings: 2,
    ingredients: [{ name: 'semolina', qty: 150 }, { name: 'onion', qty: 60 }, { name: 'carrot', qty: 60 }, { name: 'peas', qty: 50 }, { name: 'ginger', qty: 5 }, { name: 'green chilli', qty: 5 }],
    steps: ['Dry roast the semolina until it smells nutty. Set aside.', 'Heat oil, add mustard seeds, ginger, green chilli and onion.', 'Add diced carrot and peas, cook 3 minutes.', 'Add 2 cups of hot water and salt, bring to a boil.', 'Stir in the semolina slowly, cover and cook 2 minutes.'],
    nutrition: { kcal: 260, protein: 7, carbs: 44 },
  },
  {
    id: 'masala-omelette', title: 'Masala Omelette', time: 10, servings: 2,
    ingredients: [{ name: 'egg', qty: 200 }, { name: 'onion', qty: 50 }, { name: 'tomato', qty: 50 }, { name: 'green chilli', qty: 5 }, { name: 'coriander', qty: 5 }],
    steps: ['Beat the egg with salt and turmeric.', 'Mix in chopped onion, tomato, green chilli and coriander.', 'Pour onto a hot oiled pan and cook until set; fold and serve.'],
    nutrition: { kcal: 200, protein: 13, carbs: 5 },
  },
  {
    id: 'gobi-matar', title: 'Gobi Matar', time: 25, servings: 3,
    ingredients: [{ name: 'cauliflower', qty: 400 }, { name: 'peas', qty: 100 }, { name: 'tomato', qty: 100 }, { name: 'ginger', qty: 10 }],
    steps: ['Cut cauliflower into florets and wash.', 'Heat oil, add cumin and grated ginger.', 'Add tomato, turmeric, chilli powder and salt; cook until soft.', 'Add cauliflower and peas, cover and cook on low for 12 minutes.', 'Sprinkle garam masala and serve.'],
    nutrition: { kcal: 140, protein: 6, carbs: 18 },
  },
  {
    id: 'paneer-bhurji', title: 'Paneer Bhurji', time: 15, servings: 2,
    ingredients: [{ name: 'paneer', qty: 200 }, { name: 'onion', qty: 80 }, { name: 'tomato', qty: 80 }, { name: 'capsicum', qty: 60 }],
    steps: ['Crumble the paneer.', 'Heat oil, add cumin and onion; cook until soft.', 'Add capsicum and tomato with turmeric, chilli powder and salt.', 'Add paneer, mix and cook 3 minutes.'],
    nutrition: { kcal: 320, protein: 18, carbs: 9 },
  },
  {
    id: 'lauki-dal', title: 'Lauki Dal', time: 30, servings: 3,
    ingredients: [{ name: 'bottle gourd', qty: 250 }, { name: 'toor dal', qty: 150 }, { name: 'tomato', qty: 80 }],
    steps: ['Peel and cube the bottle gourd.', 'Pressure cook dal and bottle gourd with turmeric and water for 3 whistles.', 'Heat oil, add cumin, hing and tomato; cook until soft.', 'Pour over the dal, add salt and simmer 5 minutes.'],
    nutrition: { kcal: 190, protein: 11, carbs: 30 },
  },
  {
    id: 'methi-thepla', title: 'Methi Thepla', time: 30, servings: 3,
    ingredients: [{ name: 'wheat flour', qty: 200 }, { name: 'methi', qty: 100 }, { name: 'curd', qty: 60 }],
    steps: ['Chop the methi finely.', 'Mix flour, methi, curd, turmeric, chilli powder, salt and a little oil.', 'Knead into a soft dough with water as needed; rest 10 minutes.', 'Roll thin and cook on a hot tawa with a little oil until spotted on both sides.'],
    nutrition: { kcal: 240, protein: 8, carbs: 40 },
  },
  {
    id: 'matar-pulao', title: 'Matar Pulao', time: 25, servings: 3,
    ingredients: [{ name: 'rice', qty: 200 }, { name: 'peas', qty: 80 }, { name: 'onion', qty: 50 }],
    steps: ['Rinse and soak rice for 15 minutes.', 'Heat oil, add cumin and sliced onion; fry until golden.', 'Add peas, drained rice, salt and 1.75x water.', 'Cover and cook on low until the water is absorbed.'],
    nutrition: { kcal: 280, protein: 6, carbs: 55 },
  },
  {
    id: 'chicken-curry', title: 'Home-style Chicken Curry', time: 45, servings: 4,
    ingredients: [{ name: 'chicken', qty: 500 }, { name: 'onion', qty: 150 }, { name: 'tomato', qty: 150 }, { name: 'curd', qty: 100 }, { name: 'ginger', qty: 15 }, { name: 'garlic', qty: 15 }],
    steps: ['Marinate chicken with curd, turmeric, chilli powder and salt for 20 minutes.', 'Fry onion until deep golden, add ginger and garlic.', 'Add tomato and cook until oil separates.', 'Add the chicken and cook covered 20 minutes, stirring often.', 'Finish with garam masala.'],
    nutrition: { kcal: 320, protein: 30, carbs: 10 },
  },
  {
    id: 'banana-oats', title: 'Banana Oats Porridge', time: 10, servings: 2,
    ingredients: [{ name: 'oats', qty: 80 }, { name: 'milk', qty: 250 }, { name: 'banana', qty: 100 }, { name: 'jaggery', qty: 15 }],
    steps: ['Simmer oats in milk for 5 minutes, stirring.', 'Mash in the ripe banana.', 'Sweeten with jaggery to taste.'],
    nutrition: { kcal: 250, protein: 9, carbs: 42 },
  },
  {
    id: 'raita', title: 'Kheera Raita', time: 5, servings: 2,
    ingredients: [{ name: 'cucumber', qty: 150 }, { name: 'curd', qty: 200 }],
    steps: ['Grate the cucumber and squeeze out excess water.', 'Whisk curd with salt and roasted cumin.', 'Mix together and chill.'],
    nutrition: { kcal: 90, protein: 5, carbs: 8 },
  },
  {
    id: 'patta-gobi', title: 'Patta Gobi Sabzi', time: 20, servings: 3,
    ingredients: [{ name: 'cabbage', qty: 400 }, { name: 'carrot', qty: 60 }, { name: 'peas', qty: 50 }, { name: 'green chilli', qty: 5 }],
    steps: ['Shred the cabbage and carrot.', 'Heat oil, add mustard seeds and green chilli.', 'Add cabbage, carrot, peas, turmeric and salt.', 'Stir-fry on medium heat for 8–10 minutes.'],
    nutrition: { kcal: 110, protein: 4, carbs: 14 },
  },
  {
    id: 'bhindi', title: 'Bhindi Masala', time: 25, servings: 3,
    ingredients: [{ name: 'okra', qty: 300 }, { name: 'onion', qty: 80 }, { name: 'tomato', qty: 80 }],
    steps: ['Wash and fully dry the okra, then slice.', 'Fry okra in oil until no longer sticky; set aside.', 'Cook onion and tomato with spices until soft.', 'Add the okra back and toss for 3 minutes.'],
    nutrition: { kcal: 130, protein: 3, carbs: 14 },
  },
  {
    id: 'baingan-bharta', title: 'Baingan Bharta', time: 35, servings: 3,
    ingredients: [{ name: 'brinjal', qty: 400 }, { name: 'onion', qty: 80 }, { name: 'tomato', qty: 100 }, { name: 'garlic', qty: 10 }],
    steps: ['Roast the brinjal directly on a flame until the skin is charred and the inside soft.', 'Peel and mash.', 'Fry onion and garlic, add tomato and spices and cook until soft.', 'Add the mashed brinjal and cook 5 minutes.'],
    nutrition: { kcal: 120, protein: 3, carbs: 16 },
  },
];

// Replace an ingredient name (and its aliases) inside free text, e.g. the steps.
function replaceInText(text, from, to) {
  const item = findIngredient(from);
  const words = [from, ...(item?.aliases || [])].sort((a, b) => b.length - a.length);
  let out = text;
  for (const w of words) out = out.replace(new RegExp(`\\b${w}s?\\b`, 'gi'), to);
  return out;
}

// Try to make a recipe safe by swapping blocked ingredients for safe ones.
// The adapted recipe is then checked AGAIN by the safety engine.
export function adaptRecipe(recipe, profile, haveNames = new Set()) {
  let adapted = { ...recipe, ingredients: [...recipe.ingredients], steps: [...(recipe.steps || [])], swapsMade: [] };
  adapted.ingredients = adapted.ingredients.map((ing) => {
    if (!checkIngredient(ing.name, profile).blocked) return ing;
    const options = (SWAPS[canonicalName(ing.name)] || []).filter((s) => !checkIngredient(s, profile).blocked);
    const best = options.find((s) => haveNames.has(s)) || options[0];
    if (!best) return ing; // no safe swap -> stays blocked
    adapted.swapsMade.push(`${ing.name} → ${best}`);
    adapted.steps = adapted.steps.map((s) => replaceInText(s, ing.name, best));
    adapted.title = replaceInText(adapted.title, ing.name, best);
    return { ...ing, name: best };
  });
  return { recipe: adapted, check: checkRecipe(adapted, profile) };
}

// Urgency points for an inventory item that is close to expiry.
function urgency(item, today) {
  const d = daysLeft(item.expiry, today);
  if (d <= 1) return 3;
  if (d <= 3) return 2;
  if (d <= 5) return 1;
  return 0;
}

// Rank recipes by: how much of it you already have + how much it rescues near-expiry food.
// Returns { matches: [...], blocked: [...] }
export function matchRecipes(recipes, inventory, profile, today = new Date()) {
  const inv = new Map(inventory.map((i) => [canonicalName(i.name), i]));
  const haveNames = new Set(inv.keys());
  const matches = [];
  const blocked = [];

  for (const original of recipes) {
    const { recipe, check } = adaptRecipe(original, profile, haveNames);
    if (!check.safe) {
      blocked.push({ recipe: original, reasons: check.blocked });
      continue;
    }
    const have = [];
    const missing = [];
    const swaps = [];
    let rescuePoints = 0;
    for (const ing of recipe.ingredients) {
      const key = canonicalName(ing.name);
      if (inv.has(key)) {
        have.push(key);
        rescuePoints += urgency(inv.get(key), today);
      } else {
        const sub = (SWAPS[key] || []).find((s) => haveNames.has(s) && !checkIngredient(s, profile).blocked);
        if (sub) swaps.push(`${key} → ${sub}`);
        else missing.push(key);
      }
    }
    const coverage = (have.length + swaps.length) / recipe.ingredients.length;
    if (have.length === 0 || coverage < 0.5) continue;
    matches.push({
      recipe, warnings: check.warnings, have, missing, swaps, rescuePoints,
      score: coverage * 10 + rescuePoints * 2 - missing.length,
      source: original.source || 'Local recipe set',
    });
  }
  matches.sort((a, b) => b.score - a.score);
  return { matches, blocked };
}
