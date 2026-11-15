// INGREDIENT CATALOGUE
// One place that knows, for every ingredient:
//   aliases  - other names people type or the AI returns (Hindi, plural, spelling variants)
//   category - used by diet rules (e.g. vegetarians exclude "meat")
//   shelf    - typical fridge/pantry life in days, used to auto-fill expiry dates
//   price    - rough Indian retail price in Rs per kg, used for the money-saved estimate
//   tags     - nutrition flags used by health rules (high_gi, high_sodium, added_sugar, ...)
//   allergens- which allergen groups this ingredient belongs to
// These numbers are approximations for a prototype. Edit them freely.

export const INGREDIENTS = [
  // Vegetables
  { name: 'potato', aliases: ['aloo', 'potatoes', 'batata'], category: 'vegetable', shelf: 30, price: 30, tags: ['high_gi', 'root'] },
  { name: 'onion', aliases: ['pyaz', 'pyaaz', 'kanda', 'onions'], category: 'vegetable', shelf: 30, price: 40, tags: ['root', 'allium'] },
  { name: 'tomato', aliases: ['tamatar', 'tomatoes'], category: 'vegetable', shelf: 7, price: 40, tags: [] },
  { name: 'spinach', aliases: ['palak'], category: 'leafy', shelf: 3, price: 60, tags: ['high_potassium'] },
  { name: 'methi', aliases: ['fenugreek leaves', 'fenugreek'], category: 'leafy', shelf: 3, price: 80, tags: [] },
  { name: 'coriander', aliases: ['dhania', 'cilantro', 'coriander leaves'], category: 'leafy', shelf: 4, price: 100, tags: [] },
  { name: 'cauliflower', aliases: ['gobi', 'phool gobi'], category: 'vegetable', shelf: 7, price: 40, tags: [] },
  { name: 'cabbage', aliases: ['patta gobi', 'band gobi'], category: 'vegetable', shelf: 10, price: 30, tags: [] },
  { name: 'carrot', aliases: ['gajar', 'carrots'], category: 'vegetable', shelf: 14, price: 50, tags: ['root'] },
  { name: 'peas', aliases: ['matar', 'green peas'], category: 'vegetable', shelf: 5, price: 80, tags: [] },
  { name: 'capsicum', aliases: ['shimla mirch', 'bell pepper'], category: 'vegetable', shelf: 7, price: 80, tags: [] },
  { name: 'brinjal', aliases: ['baingan', 'eggplant', 'aubergine'], category: 'vegetable', shelf: 6, price: 40, tags: [] },
  { name: 'okra', aliases: ['bhindi', 'lady finger', 'ladyfinger'], category: 'vegetable', shelf: 4, price: 60, tags: [] },
  { name: 'bottle gourd', aliases: ['lauki', 'ghiya', 'dudhi'], category: 'vegetable', shelf: 7, price: 40, tags: [] },
  { name: 'cucumber', aliases: ['kheera', 'kakdi'], category: 'vegetable', shelf: 6, price: 40, tags: [] },
  { name: 'green chilli', aliases: ['hari mirch', 'green chillies', 'chilli'], category: 'vegetable', shelf: 10, price: 80, tags: [] },
  { name: 'garlic', aliases: ['lahsun', 'lehsun'], category: 'vegetable', shelf: 60, price: 200, tags: ['root', 'allium'] },
  { name: 'ginger', aliases: ['adrak'], category: 'vegetable', shelf: 21, price: 150, tags: ['root'] },
  { name: 'lemon', aliases: ['nimbu', 'lime'], category: 'fruit', shelf: 14, price: 100, tags: [] },
  { name: 'banana', aliases: ['kela', 'bananas'], category: 'fruit', shelf: 4, price: 50, tags: ['high_gi'] },
  { name: 'apple', aliases: ['seb', 'apples'], category: 'fruit', shelf: 21, price: 150, tags: [] },

  // Dairy & protein
  { name: 'milk', aliases: ['doodh'], category: 'dairy', shelf: 3, price: 60, tags: [], allergens: ['dairy'] },
  { name: 'curd', aliases: ['dahi', 'yogurt', 'yoghurt'], category: 'dairy', shelf: 5, price: 80, tags: [], allergens: ['dairy'] },
  { name: 'paneer', aliases: ['cottage cheese'], category: 'dairy', shelf: 5, price: 400, tags: [], allergens: ['dairy'] },
  { name: 'butter', aliases: ['makhan'], category: 'dairy', shelf: 30, price: 500, tags: ['high_sat_fat'], allergens: ['dairy'] },
  { name: 'ghee', aliases: ['clarified butter'], category: 'dairy', shelf: 180, price: 600, tags: ['high_sat_fat'], allergens: ['dairy'] },
  { name: 'cheese', aliases: [], category: 'dairy', shelf: 21, price: 500, tags: ['high_sodium'], allergens: ['dairy'] },
  { name: 'egg', aliases: ['eggs', 'anda', 'ande'], category: 'egg', shelf: 21, price: 150, tags: [], allergens: ['egg'] },
  { name: 'chicken', aliases: ['murgh', 'murg'], category: 'meat', shelf: 2, price: 250, tags: [] },
  { name: 'fish', aliases: ['machli', 'machhli'], category: 'fish', shelf: 2, price: 300, tags: [], allergens: ['fish'] },
  { name: 'prawns', aliases: ['shrimp', 'jhinga'], category: 'fish', shelf: 2, price: 600, tags: [], allergens: ['shellfish'] },
  { name: 'tofu', aliases: [], category: 'pulse', shelf: 5, price: 300, tags: [], allergens: ['soy'] },

  // Grains & pulses
  { name: 'rice', aliases: ['chawal', 'basmati'], category: 'grain', shelf: 365, price: 70, tags: ['high_gi'] },
  { name: 'wheat flour', aliases: ['atta', 'whole wheat flour'], category: 'grain', shelf: 120, price: 45, tags: [], allergens: ['gluten'] },
  { name: 'bread', aliases: ['pav', 'bread slices'], category: 'grain', shelf: 4, price: 80, tags: ['high_gi'], allergens: ['gluten'] },
  { name: 'semolina', aliases: ['suji', 'sooji', 'rava'], category: 'grain', shelf: 120, price: 50, tags: [], allergens: ['gluten'] },
  { name: 'poha', aliases: ['flattened rice', 'beaten rice'], category: 'grain', shelf: 120, price: 60, tags: [] },
  { name: 'oats', aliases: [], category: 'grain', shelf: 180, price: 200, tags: [] },
  { name: 'besan', aliases: ['gram flour', 'chickpea flour'], category: 'pulse', shelf: 120, price: 100, tags: [] },
  { name: 'moong dal', aliases: ['moong', 'green gram'], category: 'pulse', shelf: 180, price: 120, tags: [] },
  { name: 'toor dal', aliases: ['arhar dal', 'tur dal', 'pigeon pea'], category: 'pulse', shelf: 180, price: 150, tags: [] },
  { name: 'chickpeas', aliases: ['chana', 'chole', 'kabuli chana'], category: 'pulse', shelf: 180, price: 120, tags: [] },

  // Nuts & seeds (allergens)
  { name: 'peanut', aliases: ['peanuts', 'groundnut', 'groundnuts', 'moongphali', 'mungfali', 'peanut butter', 'peanut oil', 'groundnut oil'], category: 'nut', shelf: 120, price: 160, tags: [], allergens: ['peanut'] },
  { name: 'cashew', aliases: ['kaju', 'cashews', 'cashew paste'], category: 'nut', shelf: 120, price: 900, tags: [], allergens: ['tree_nut'] },
  { name: 'almond', aliases: ['badam', 'almonds'], category: 'nut', shelf: 180, price: 900, tags: [], allergens: ['tree_nut'] },
  { name: 'sesame', aliases: ['til', 'sesame seeds'], category: 'nut', shelf: 180, price: 200, tags: [], allergens: ['sesame'] },

  // Sweeteners & extras
  { name: 'sugar', aliases: ['cheeni', 'chini'], category: 'other', shelf: 365, price: 45, tags: ['added_sugar'] },
  { name: 'jaggery', aliases: ['gur', 'gud'], category: 'other', shelf: 180, price: 70, tags: ['added_sugar'] },
  { name: 'honey', aliases: ['shahad'], category: 'other', shelf: 365, price: 400, tags: ['added_sugar', 'animal_product'] },
  { name: 'pickle', aliases: ['achar', 'achaar'], category: 'other', shelf: 180, price: 200, tags: ['high_sodium'] },
  { name: 'soy sauce', aliases: [], category: 'other', shelf: 180, price: 200, tags: ['high_sodium'], allergens: ['soy', 'gluten'] },
];

// Pantry staples assumed to be present in most Indian kitchens.
// Recipes may use them without the user scanning them.
export const STAPLES = ['salt', 'water', 'oil', 'turmeric', 'red chilli powder', 'cumin', 'mustard seeds', 'garam masala', 'hing'];

// Smart swaps: if a recipe needs X and you don't have it (or can't eat it), try Y.
// Every swap is still passed through the safety check before being shown.
export const SWAPS = {
  paneer: ['tofu', 'chickpeas'],
  curd: ['lemon'],
  cream: ['milk', 'cashew'],
  butter: ['ghee', 'oil'],
  egg: ['besan'],
  rice: ['poha', 'oats'],
  bread: ['wheat flour'],
  sugar: ['jaggery'],
  potato: ['cauliflower', 'bottle gourd'],
  spinach: ['methi'],
  methi: ['spinach'],
  peanut: ['sesame', 'cashew'],
  'wheat flour': ['besan'],
  semolina: ['poha', 'oats'],
  chicken: ['paneer', 'chickpeas'],
};

// Build a fast lookup: every alias -> catalogue entry
const LOOKUP = new Map();
for (const item of INGREDIENTS) {
  LOOKUP.set(item.name, item);
  for (const a of item.aliases) LOOKUP.set(a, item);
}

// Turns "Aloo ", "potatoes", "Potato (2)" into the catalogue entry for potato.
export function findIngredient(raw) {
  const text = String(raw || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  if (LOOKUP.has(text)) return LOOKUP.get(text);
  // simple plural handling: "tomatoes" -> "tomato", "chillies" -> "chilli"
  const singular = text.replace(/ies$/, 'y').replace(/oes$/, 'o').replace(/s$/, '');
  if (LOOKUP.has(singular)) return LOOKUP.get(singular);
  // partial match: "fresh palak leaves" contains "palak"
  for (const [key, item] of LOOKUP) {
    if (key.length > 3 && new RegExp(`\\b${key}\\b`).test(text)) return item;
  }
  return null;
}

// Canonical name for anything the user types. Unknown items keep their own name.
export function canonicalName(raw) {
  const found = findIngredient(raw);
  return found ? found.name : String(raw || '').toLowerCase().trim();
}

// Default expiry date (YYYY-MM-DD) for a newly added item.
export function defaultExpiry(raw, from = new Date()) {
  const days = findIngredient(raw)?.shelf ?? 7;
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysLeft(expiry, today = new Date()) {
  if (!expiry) return Infinity;
  const ms = new Date(expiry + 'T23:59:59') - today;
  return Math.floor(ms / 86400000);
}

export const ALL_NAMES = INGREDIENTS.map((i) => i.name);
