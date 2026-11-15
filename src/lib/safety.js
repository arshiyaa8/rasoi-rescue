// SAFETY ENGINE  (plain code, no AI)
// This is the most important file. The AI is never trusted to remember an allergy.
// Every ingredient list AND every recipe the AI writes is checked here.
//   - Allergies, diet restrictions and the "doctor said avoid" list  -> BLOCK
//   - Health conditions (diabetes, BP, cholesterol)                  -> WARN (general guidance only)

import { INGREDIENTS, findIngredient } from './ingredients.js';

export const ALLERGY_OPTIONS = [
  { id: 'peanut', label: 'Peanut' },
  { id: 'tree_nut', label: 'Tree nuts (cashew, almond…)' },
  { id: 'dairy', label: 'Dairy / lactose' },
  { id: 'gluten', label: 'Gluten / wheat' },
  { id: 'egg', label: 'Egg' },
  { id: 'soy', label: 'Soy' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'sesame', label: 'Sesame' },
];

export const CONDITION_OPTIONS = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hypertension', label: 'High blood pressure' },
  { id: 'cholesterol', label: 'High cholesterol' },
];

export const DIET_OPTIONS = [
  { id: 'none', label: 'No restriction' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'eggetarian', label: 'Eggetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'jain', label: 'Jain' },
];

// Extra words that hide an allergen but are not in the catalogue.
const EXTRA_ALLERGEN_WORDS = {
  peanut: ['peanut', 'groundnut', 'moongphali', 'mungfali'],
  tree_nut: ['pistachio', 'pista', 'walnut', 'akhrot', 'nut paste', 'mixed nuts'],
  dairy: ['cream', 'malai', 'khoya', 'khoa', 'whey', 'lassi', 'buttermilk', 'chaas', 'mawa'],
  gluten: ['maida', 'wheat', 'barley', 'rusk', 'noodles', 'pasta', 'roti', 'chapati', 'paratha'],
  egg: ['mayonnaise', 'mayo', 'omelette'],
  soy: ['soya', 'soybean', 'soy'],
  fish: ['tuna', 'salmon', 'anchovy', 'fish sauce'],
  shellfish: ['crab', 'lobster', 'shrimp', 'prawn'],
  sesame: ['tahini', 'gingelly'],
};

const DIET_WORDS = {
  meat: ['chicken', 'mutton', 'lamb', 'pork', 'beef', 'keema', 'meat', 'bacon', 'ham'],
  fish: ['fish', 'prawn', 'prawns', 'shrimp', 'tuna', 'crab'],
  egg: ['egg', 'eggs', 'omelette', 'anda'],
};

// Which ingredient categories / tags each diet forbids.
const DIET_RULES = {
  vegetarian: { categories: ['meat', 'fish', 'egg'], tags: [] },
  eggetarian: { categories: ['meat', 'fish'], tags: [] },
  vegan: { categories: ['meat', 'fish', 'egg', 'dairy'], tags: ['animal_product'] },
  jain: { categories: ['meat', 'fish', 'egg'], tags: ['root', 'allium', 'animal_product'] },
};

// Health conditions -> nutrition tags to warn about (never a diagnosis).
const CONDITION_RULES = {
  diabetes: {
    added_sugar: 'contains added sugar; consider skipping or using very little',
    high_gi: 'high-GI carbohydrate; keep the portion moderate and pair with dal, curd or vegetables',
  },
  hypertension: { high_sodium: 'salty ingredient; use less added salt' },
  cholesterol: { high_sat_fat: 'high in saturated fat; use a small amount' },
};

// All words that signal a given allergen = catalogue names + aliases + extra words.
function allergenWords(allergy) {
  const words = new Set(EXTRA_ALLERGEN_WORDS[allergy] || []);
  for (const item of INGREDIENTS) {
    if (item.allergens?.includes(allergy)) {
      words.add(item.name);
      item.aliases.forEach((a) => words.add(a));
    }
  }
  return [...words];
}

function containsWord(text, word) {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`, 'i').test(text);
}

// Check ONE ingredient. Returns { blocked: string|null, warnings: string[] }
export function checkIngredient(rawName, profile = {}) {
  const item = findIngredient(rawName);
  const name = String(rawName).toLowerCase();
  const allergies = profile.allergies || [];

  // 1. Allergies (catalogue data + word scan, so unknown AI words are caught too)
  for (const allergy of allergies) {
    if (item?.allergens?.includes(allergy) || allergenWords(allergy).some((w) => containsWord(name, w))) {
      return { blocked: `${rawName}: allergy (${label(ALLERGY_OPTIONS, allergy)})`, warnings: [] };
    }
  }

  // 2. Doctor's / personal avoid list (free text, e.g. "brinjal, pickle")
  for (const avoid of profile.avoid || []) {
    const a = avoid.toLowerCase().trim();
    if (!a) continue;
    if (containsWord(name, a) || item?.name === findIngredient(a)?.name) {
      return { blocked: `${rawName}: on your avoid list`, warnings: [] };
    }
  }

  // 3. Diet restriction
  const rule = DIET_RULES[profile.diet];
  if (rule) {
    const byCategory = item && rule.categories.includes(item.category);
    const byTag = item && item.tags.some((t) => rule.tags.includes(t));
    const byWord = !item && rule.categories.some((c) => (DIET_WORDS[c] || []).some((w) => containsWord(name, w)));
    if (byCategory || byTag || byWord) {
      return { blocked: `${rawName}: not ${label(DIET_OPTIONS, profile.diet)}`, warnings: [] };
    }
  }

  // 4. Health conditions -> warnings only
  const warnings = [];
  for (const cond of profile.conditions || []) {
    for (const [tag, msg] of Object.entries(CONDITION_RULES[cond] || {})) {
      if (item?.tags.includes(tag)) warnings.push(`${item.name}: ${msg}`);
    }
  }
  return { blocked: null, warnings };
}

// Check a WHOLE recipe, including its title and steps.
// Steps are scanned too, because AI sometimes writes "garnish with peanuts" in a step
// without listing peanuts as an ingredient.
export function checkRecipe(recipe, profile = {}) {
  const blocked = [];
  const warnings = [];
  for (const ing of recipe.ingredients || []) {
    const r = checkIngredient(ing.name || ing, profile);
    if (r.blocked) blocked.push(r.blocked);
    warnings.push(...r.warnings);
  }
  const fullText = [recipe.title, ...(recipe.steps || [])].join(' ');
  for (const allergy of profile.allergies || []) {
    const hit = allergenWords(allergy).find((w) => containsWord(fullText, w));
    if (hit) blocked.push(`mentions "${hit}" in the method (${label(ALLERGY_OPTIONS, allergy)} allergy)`);
  }
  const rule = DIET_RULES[profile.diet];
  if (rule) {
    for (const c of rule.categories) {
      const hit = (DIET_WORDS[c] || []).find((w) => containsWord(fullText, w));
      if (hit) blocked.push(`mentions "${hit}" in the method (not ${label(DIET_OPTIONS, profile.diet)})`);
    }
  }
  return { safe: blocked.length === 0, blocked: [...new Set(blocked)], warnings: [...new Set(warnings)] };
}

function label(options, id) {
  return options.find((o) => o.id === id)?.label || id;
}
