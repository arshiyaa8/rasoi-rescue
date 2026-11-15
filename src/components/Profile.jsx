// STEP 1 OF THE FLOW: health profile (conditions, allergies, diet, doctor's notes)
import React, { useState } from 'react';
import { ALLERGY_OPTIONS, CONDITION_OPTIONS, DIET_OPTIONS } from '../lib/safety.js';

export default function Profile({ profile, onSave }) {
  const [p, setP] = useState(profile);
  const [avoidText, setAvoidText] = useState((profile.avoid || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const toggle = (key, id) =>
    setP({ ...p, [key]: p[key].includes(id) ? p[key].filter((x) => x !== id) : [...p[key], id] });

  const hasHealthData = p.conditions.length > 0 || p.doctorNotes.trim() || avoidText.trim();

  async function save(e) {
    e.preventDefault();
    if (hasHealthData && !p.consent) return setMsg('Please tick the consent box to store health information.');
    setMsg('');
    setSaving(true);
    const avoid = avoidText.split(',').map((s) => s.trim()).filter(Boolean);
    await onSave({ ...p, avoid });
    setSaving(false);
  }

  return (
    <form className="card stack" onSubmit={save}>
      <h2>Culinary & Health Safeguards</h2>
      <p className="muted">All recipes, smart substitutions, and ingredient suggestions are strictly cross-checked against your personal health requirements.</p>

      <label>
        Your Name
        <input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="e.g. Asha Sharma" required />
      </label>

      <fieldset>
        <legend>Dietary Preference</legend>
        <div className="chips">
          {DIET_OPTIONS.map((o) => (
            <button type="button" key={o.id} className={`chip ${p.diet === o.id ? 'on' : ''}`} onClick={() => setP({ ...p, diet: o.id })}>
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Allergies & Intolerances (Strictly Filtered Out)</legend>
        <div className="chips">
          {ALLERGY_OPTIONS.map((o) => (
            <button type="button" key={o.id} className={`chip ${p.allergies.includes(o.id) ? 'on red' : ''}`} onClick={() => toggle('allergies', o.id)}>
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Health Conditions (Generates Clinical Warnings & Culinary Guidance)</legend>
        <div className="chips">
          {CONDITION_OPTIONS.map((o) => (
            <button type="button" key={o.id} className={`chip ${p.conditions.includes(o.id) ? 'on' : ''}`} onClick={() => toggle('conditions', o.id)}>
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label>
        Specific Ingredients to Strictly Avoid (Comma separated)
        <input value={avoidText} onChange={(e) => setAvoidText(e.target.value)} placeholder="e.g. brinjal, karela, excess sodium" />
      </label>

      <label>
        Physician or Dietitian Guidance Notes
        <textarea rows={3} value={p.doctorNotes} onChange={(e) => setP({ ...p, doctorNotes: e.target.value })} placeholder="e.g. Low glycemic index, avoid refined oils, favor high fiber and gentle spices." />
      </label>

      <label className="row">
        <input type="checkbox" checked={p.consent} onChange={(e) => setP({ ...p, consent: e.target.checked })} />
        <span className="small">I consent to Rasoi Rescue storing this dietary and health information locally to safely personalise my recipes.</span>
      </label>

      {msg && <div className="alert red">{msg}</div>}
      <button className="primary big" disabled={saving}>{saving ? 'Saving Profile…' : 'Save Health Profile & Enter Kitchen →'}</button>
    </form>
  );
}
