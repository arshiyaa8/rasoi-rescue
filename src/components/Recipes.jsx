// STEPS 5-6 OF THE FLOW: fetch candidate recipes, ask Gemini for more, then safety-check EVERYTHING.
import React, { useState } from 'react';
import { getCandidateRecipes } from '../lib/recipedb.js';
import { generateRecipes } from '../lib/gemini.js';
import { matchRecipes } from '../lib/recipes.js';
import { checkIngredient } from '../lib/safety.js';
import { canonicalName, daysLeft } from '../lib/ingredients.js';
import { toast } from '../lib/toast.js';
import { Cube, Popup, Tilt } from './Fx.jsx';

export default function Recipes({ inventory, profile, onCook }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const [showBlocked, setShowBlocked] = useState(false);
  const [detail, setDetail] = useState(null); // recipe match shown in the details pop-up

  async function find() {
    setBusy(true);
    setAiError('');
    // Safety BEFORE generation: the AI is only told about ingredients this user can eat.
    const safeItems = inventory.filter((i) => !checkIngredient(i.name, profile).blocked);
    const safeNames = safeItems.map((i) => canonicalName(i.name));
    const useFirst = safeItems.filter((i) => daysLeft(i.expiry) <= 3).map((i) => canonicalName(i.name));
    const uniqueFirst = [...new Set(useFirst)];

    const candidates = await getCandidateRecipes(safeNames);
    const fromDb = matchRecipes(candidates, inventory, profile);

    let fromAi = { matches: [], blocked: [] };
    try {
      const aiRecipes = await generateRecipes({
        safeIngredients: [...new Set(safeNames)], useFirst: uniqueFirst, profile,
        candidateTitles: fromDb.matches.slice(0, 5).map((m) => m.recipe.title),
      });
      // Safety AFTER generation: AI recipes go through exactly the same checks.
      fromAi = matchRecipes(aiRecipes.map((r, i) => ({ id: `ai-${i}`, ...r })), inventory, profile);
    } catch (e) {
      setAiError(`AI suggestions unavailable (${e.message}). Showing database recipes only.`);
    }

    const matches = [...fromAi.matches, ...fromDb.matches].sort((a, b) => b.score - a.score).slice(0, 8);
    const blocked = [...fromAi.blocked, ...fromDb.blocked];
    setResult({ matches, blocked, useFirst: uniqueFirst });
    setBusy(false);
    toast(`🍲 ${matches.length} safe recipes found`);
    if (blocked.length) toast(`🛡 ${blocked.length} recipes blocked by the safety check`, 'warn');
  }

  if (inventory.length === 0) {
    return (
      <div className="card center-text" style={{ padding: '36px 20px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🧺</div>
        <h2>Your Kitchen Pantry is Empty</h2>
        <p className="muted" style={{ margin: '8px 0 16px' }}>Stock your pantry with ingredients in the Kitchen tab to uncover bespoke, allergy-safe recipes.</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <section className="card stack hero-card">
        <h2>AI Culinary Matchmaker</h2>
        <p className="muted">Personalised recipes crafted from what you currently have — ranked to rescue near-expiry ingredients and verified against your health profile.</p>
        <button className="primary big" onClick={find} disabled={busy}>🍲 Match Pantry & Find Recipes</button>
        {profile.allergies.includes('peanut') && <p className="small muted">🛡 Peanut allergy detected: recipes strictly use non-peanut oils (sunflower, mustard, or ghee).</p>}
        {aiError && <div className="alert amber">{aiError}</div>}
      </section>

      {busy && (
        <Popup title="Your AI Masterchef is at Work">
          <Cube faces={['🍲', '🥘', '🫓', '🍛', '🥗', '🍳']} />
          <p className="muted center-text">Synthesising recipes from your pantry ingredients and verifying allergy safety…</p>
        </Popup>
      )}

      {result && (
        <>
          {result.useFirst.length > 0 && (
            <div className="alert amber">
              <span>🌱</span>
              <div>
                <strong>Ingredients to Rescue First:</strong> {result.useFirst.join(', ')}
              </div>
            </div>
          )}
          {result.matches.length === 0 && (
            <div className="card center-text muted" style={{ padding: '28px' }}>
              No recipes matched your exact combination. Try adding staple ingredients like onion, tomato, spices, or flour!
            </div>
          )}

          {result.matches.map((m, i) => (
            <Tilt as="article" className="card recipe" key={m.recipe.id} style={{ animationDelay: `${i * 90}ms` }}>
              <div className="row between wrap">
                <h3>{m.recipe.title}</h3>
                <span className={`badge ${m.source.startsWith('Gemini') ? 'purple' : 'grey'}`}>
                  {m.source.startsWith('Gemini') ? '✦ Gemini AI Chef' : '📜 Classic Heritage'}
                </span>
              </div>
              <div className="row wrap small muted" style={{ gap: '12px' }}>
                <span>⏱ {m.recipe.time} min</span>
                <span>🍽 {m.recipe.servings} servings</span>
                {m.recipe.nutrition?.kcal && <span>🔥 ~{m.recipe.nutrition.kcal} kcal/serving</span>}
              </div>
              {m.rescuePoints > 0 && (
                <p className="small rescue">
                  <span>🌱</span> Rescues near-expiry ingredients
                </p>
              )}
              {m.recipe.why && <p className="small" style={{ fontStyle: 'italic', color: 'var(--ink-secondary)' }}>"{m.recipe.why}"</p>}
              <p className="small"><strong>From your pantry:</strong> {m.have.join(', ')}</p>
              {m.recipe.swapsMade?.length > 0 && <p className="small"><strong>Safe Swaps:</strong> {m.recipe.swapsMade.join(', ')}</p>}
              {m.swaps.length > 0 && <p className="small"><strong>Suggested Swaps:</strong> {m.swaps.join(', ')}</p>}
              {m.missing.length > 0 && <p className="small"><strong>Pantry items to fetch:</strong> {m.missing.join(', ')}</p>}
              {m.warnings.length > 0 && (
                <ul className="warnings small">
                  {m.warnings.map((w) => <li key={w}>⚠ {w}</li>)}
                </ul>
              )}
              <div className="row" style={{ marginTop: '8px' }}>
                <button className="ghost" onClick={() => setDetail(m)}>Recipe Details</button>
                <button className="primary grow" onClick={() => onCook(m.recipe)}>Cook This Dish →</button>
              </div>
            </Tilt>
          ))}

          {result.blocked.length > 0 && (
            <section className="card">
              <button className="ghost" onClick={() => setShowBlocked(!showBlocked)}>
                🛡 {result.blocked.length} recipes blocked for your safety {showBlocked ? '▲' : '▼'}
              </button>
              {showBlocked && (
                <ul className="small blocked">
                  {result.blocked.map((b) => (
                    <li key={b.recipe.id || b.recipe.title}>
                      <strong>{b.recipe.title}</strong>{b.recipe.source ? ` (${b.recipe.source})` : ''}: {b.reasons.join('; ')}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}

      {detail && (
        <Popup title={detail.recipe.title} onClose={() => setDetail(null)} wide>
          <div className="scroll stack">
            {detail.recipe.nutrition?.kcal && (
              <div className="macro">
                <div><b>{detail.recipe.nutrition.kcal}</b><span>kcal</span></div>
                <div><b>{detail.recipe.nutrition.protein}g</b><span>protein</span></div>
                <div><b>{detail.recipe.nutrition.carbs}g</b><span>carbs</span></div>
                <div><b>{detail.recipe.time}</b><span>min</span></div>
              </div>
            )}
            <p className="small muted">Nutrition is a per-serving estimate.</p>
            <strong>Ingredients</strong>
            <ul className="plain small">
              {detail.recipe.ingredients.map((ing) => (
                <li key={ing.name}>
                  {detail.have.includes(canonicalName(ing.name)) ? '✅' : '▫️'} {ing.name}{ing.qty ? ` · ${ing.qty} g` : ''}
                </li>
              ))}
              <li className="muted">plus salt, oil and basic spices</li>
            </ul>
            <strong>Method</strong>
            <ol className="small method">{(detail.recipe.steps || []).map((s, i) => <li key={i}>{s}</li>)}</ol>
          </div>
          <button className="primary" onClick={() => { const r = detail.recipe; setDetail(null); onCook(r); }}>Cook this</button>
        </Popup>
      )}
    </div>
  );
}
