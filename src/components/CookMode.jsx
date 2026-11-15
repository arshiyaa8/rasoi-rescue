// STEP 7 OF THE FLOW: step-by-step cooking, then update inventory + Rescue Score.
import React, { useState } from 'react';
import { cookRecipe } from '../lib/rescue.js';
import * as store from '../lib/store.js';
import { Confetti, Popup } from './Fx.jsx';

export default function CookMode({ recipe, inventory, onClose, onDone }) {
  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState(null);
  const steps = recipe.steps || [];
  const last = step === steps.length - 1;

  async function finish() {
    const { updates, entry } = cookRecipe(recipe, inventory);
    for (const u of updates) {
      if (u.remove) await store.removeItem(u.id);
      else await store.updateItem(u.id, { qty: u.qty });
    }
    await store.addRescueEntry(entry);
    setSummary(entry);
    onDone();
  }

  return (
    <Popup title={`Cooking: ${recipe.title}`} onClose={onClose} wide>
      {!summary ? (
        <>
          <div className="row between small muted">
            <span>Culinary Guide</span>
            <span>Step {step + 1} of {steps.length}</span>
          </div>
          <div className="progress"><div style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
          {/* key={step} replays the 3D flip each time the step changes */}
          <div className="step-card" key={step}>
            <span className="step-no">{step + 1}</span>
            <p className="step">{steps[step]}</p>
          </div>
          <div className="row between" style={{ marginTop: '12px' }}>
            <button className="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>← Previous Step</button>
            {last
              ? <button className="primary" onClick={finish}>✓ Mark as Cooked</button>
              : <button className="primary" onClick={() => setStep(step + 1)}>Next Step →</button>}
          </div>
        </>
      ) : (
        <div className="stack center-text celebrate" style={{ padding: '16px 8px' }}>
          <Confetti />
          <div className="medal">🏆</div>
          <h2 style={{ color: 'var(--gold-light)', margin: '4px 0' }}>Culinary Triumph!</h2>
          <div className="big-number gold">{summary.kg_rescued} kg</div>
          <p style={{ fontWeight: 600, color: 'var(--ink)' }}>Food rescued from kitchen waste</p>
          <p className="muted" style={{ margin: '6px 0' }}>≈ ₹{summary.money_saved} saved · {summary.kg_used} kg fresh ingredients cooked</p>
          <p className="small muted">Your pantry inventory has been automatically deducted.</p>
          <button className="primary big" style={{ marginTop: '14px', width: '100%' }} onClick={onClose}>Return to Kitchen</button>
        </div>
      )}
    </Popup>
  );
}
