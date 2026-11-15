# Rasoi Rescue

An AI chef that turns the ingredients you have into health-aware Indian meals and cuts household food waste.
Team Codex · The Corporate Glitch '26

## Run it (5 minutes)

1. Install Node.js 18 or newer from nodejs.org.
2. In this folder run:
   ```
   npm install
   npm run dev
   ```
3. Open the link it prints (usually http://localhost:5173).

With no `.env` file the app runs in **Demo mode**: sample scan, sample AI recipes, data saved in the browser.
This is the safest way to present it live.

## Turn on the real AI (Gemini)

1. Get a free key at https://aistudio.google.com/apikey
2. Copy `.env.example` to `.env` and set `VITE_GEMINI_API_KEY=...`
3. Restart `npm run dev`. The badge changes from "Demo mode" to "Live".

## Turn on the cloud database (Supabase)

1. Create a project at https://supabase.com
2. SQL Editor → paste `supabase/schema.sql` → Run.
3. Authentication → Sign In / Providers → enable **Anonymous sign-ins**.
4. Put the Project URL and anon key in `.env`.

## Keep the Gemini key secret (for the final submission)

```
npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set GEMINI_API_KEY=your_key
supabase functions deploy gemini
```
Then in `.env` set `VITE_USE_EDGE_FUNCTION=true` and remove `VITE_GEMINI_API_KEY`.

## Deploy a demo link

Push to GitHub, then import the repo on vercel.com (framework: Vite) and add the same env variables.

## Folder map

```
src/
  App.jsx                 intro, screens + tab bar
  components/Intro.jsx    3D food intro screen (pure CSS 3D)
  components/Fx.jsx       effects: Tilt cards, Popup, Toasts, spinning Cube, Confetti, count-up
  lib/toast.js            tiny helper to show pop-up messages from anywhere
  styles.css              dark gold theme + all 3D animations
  components/Profile.jsx  health profile (step 1)
  components/Kitchen.jsx  scan, edit inventory, expiry flags (steps 2-4)
  components/Recipes.jsx  fetch + generate + safety-check recipes (steps 5-6)
  components/CookMode.jsx step-by-step cooking, updates Rescue Score (step 7)
  components/Impact.jsx   Rescue Score dashboard
  lib/safety.js           allergy / diet / condition rules (no AI)
  lib/ingredients.js      ingredient catalogue: Hindi names, shelf life, prices, tags
  lib/recipes.js          local recipes, smart swaps, ranking
  lib/recipedb.js         RecipeDB adapter (falls back to local recipes)
  lib/gemini.js           Gemini vision + recipe generation
  lib/rescue.js           Rescue Score maths
  lib/store.js            Supabase or localStorage
supabase/schema.sql       database tables + row level security
supabase/functions/gemini edge function that hides the API key
```

Supports general nutrition decisions only. Not medical advice.
