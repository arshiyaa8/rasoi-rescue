// STEPS 2-4 OF THE FLOW: scan or type ingredients, edit what the AI found, see use-first flags.
import React, { useState } from 'react';
import { detectIngredients } from '../lib/gemini.js';
import { ALL_NAMES, canonicalName, daysLeft, defaultExpiry, findIngredient } from '../lib/ingredients.js';
import { checkIngredient } from '../lib/safety.js';
import * as store from '../lib/store.js';
import { DEMO } from '../lib/config.js';
import { toast } from '../lib/toast.js';
import { Cube, Popup } from './Fx.jsx';

const DEFAULT_QTY = 250; // grams, when we don't know

// If an item is already in the kitchen, add to its quantity instead of creating a duplicate.
// The earlier expiry date is kept, so the use-first warning stays on the safe side.
async function addOrMerge(items, inventory) {
  const fresh = [];
  for (const item of items) {
    const existing = inventory.find((i) => canonicalName(i.name) === item.name);
    if (existing) {
      const expiry = [existing.expiry, item.expiry].filter(Boolean).sort()[0];
      await store.updateItem(existing.id, { qty: (Number(existing.qty) || 0) + item.qty, expiry });
    } else if (!fresh.some((f) => f.name === item.name)) {
      fresh.push(item);
    }
  }
  if (fresh.length) await store.addItems(fresh);
}

export default function Kitchen({ inventory, profile, onChange }) {
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(null); // [{ name, keep }] waiting for user review
  const [manual, setManual] = useState('');
  const [manualQty, setManualQty] = useState(DEFAULT_QTY);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file && !DEMO) return;
    setError('');
    setScanning(true);
    try {
      const names = await detectIngredients(file);
      setDetected(names.map((n) => ({ name: canonicalName(n), keep: true })));
    } catch (err) {
      setError(`Scan failed (${err.message}). You can add items manually below.`);
    } finally {
      setScanning(false);
    }
  }

  async function addDetected() {
    const items = detected.filter((d) => d.keep && d.name.trim()).map((d) => ({ name: canonicalName(d.name), qty: DEFAULT_QTY, expiry: defaultExpiry(d.name) }));
    await addOrMerge(items, inventory);
    setDetected(null);
    toast(`🧺 ${items.length} items added to your kitchen`);
    const notForYou = items.filter((i) => checkIngredient(i.name, profile).blocked).map((i) => i.name);
    if (notForYou.length) toast(`🛡 Not for you: ${notForYou.join(', ')}`, 'warn');
    onChange();
  }

  async function addManual(e) {
    e.preventDefault();
    if (!manual.trim()) return;
    const name = canonicalName(manual);
    await addOrMerge([{ name, qty: Number(manualQty) || DEFAULT_QTY, expiry: defaultExpiry(manual) }], inventory);
    setManual('');
    const blocked = checkIngredient(name, profile).blocked;
    toast(blocked ? `🛡 ${name} added, but it is not for you` : `✓ ${name} added`, blocked ? 'warn' : 'ok');
    onChange();
  }

  async function loadSample() {
    const today = new Date();
    const plus = (d) => { const x = new Date(today); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10); };
    await store.addItems([
      { name: 'spinach', qty: 250, expiry: plus(1) },
      { name: 'tomato', qty: 400, expiry: plus(2) },
      { name: 'potato', qty: 1000, expiry: plus(20) },
      { name: 'onion', qty: 800, expiry: plus(25) },
      { name: 'curd', qty: 400, expiry: plus(3) },
      { name: 'peas', qty: 250, expiry: plus(4) },
      { name: 'besan', qty: 500, expiry: plus(90) },
      { name: 'peanut', qty: 200, expiry: plus(60) },
    ]);
    toast('🧺 Sample kitchen loaded');
    onChange();
  }

  const sorted = [...inventory].sort((a, b) => (a.expiry || '9').localeCompare(b.expiry || '9'));
  const filtered = sorted.filter((item) => {
    if (filter === 'urgent') return daysLeft(item.expiry) <= 3;
    if (filter === 'safe') return !checkIngredient(item.name, profile).blocked;
    return true;
  });
  const urgentCount = inventory.filter((i) => daysLeft(i.expiry) <= 3).length;

  return (
    <div className="stack">
      <section className="card stack hero-card">
        <h2>Smart Pantry & Fridge Vision</h2>
        <p className="muted">Capture a photo of your fridge or pantry. The AI instantly identifies ingredients, expiry estimates, and alerts you to items needing rescue.</p>
        <label className={`primary big ${scanning ? 'disabled' : ''}`}>
          📷 Scan Fridge or Upload Photo
          <input type="file" accept="image/*" capture="environment" hidden onChange={onPhoto} disabled={scanning} />
        </label>
        {DEMO && (
          <button className="ghost" onClick={() => onPhoto({ target: { files: [], value: '' } })} disabled={scanning}>
            Run Demo Scan (Sample Fridge)
          </button>
        )}
        {error && <div className="alert red">{error}</div>}
      </section>

      {scanning && (
        <Popup title="Fridge Vision AI">
          <div className="scanner">
            <Cube />
            <div className="scanline" />
          </div>
          <p className="muted center-text">Examining pantry image and identifying ingredients…</p>
        </Popup>
      )}

      {detected && (
        <Popup title={`Identified ${detected.length} Ingredients`} onClose={() => setDetected(null)}>
          <p className="muted small">Review and adjust items before stocking your kitchen pantry.</p>
          <div className="stack scroll">
            {detected.map((d, i) => (
              <div className="row found" key={i} style={{ animationDelay: `${i * 70}ms` }}>
                <input type="checkbox" checked={d.keep} onChange={(e) => setDetected(detected.map((x, j) => (j === i ? { ...x, keep: e.target.checked } : x)))} />
                <input value={d.name} onChange={(e) => setDetected(detected.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: '10px' }}>
            <button className="primary grow" onClick={addDetected}>Add to Pantry</button>
            <button className="ghost" onClick={() => setDetected(null)}>Cancel</button>
          </div>
        </Popup>
      )}

      <form className="card row wrap" onSubmit={addManual} style={{ alignItems: 'center' }}>
        <input list="ing-names" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Add ingredient (e.g. aloo, palak, paneer, besan…)" className="grow" />
        <datalist id="ing-names">{ALL_NAMES.map((n) => <option key={n} value={n} />)}</datalist>
        <div className="row" style={{ flex: 'none' }}>
          <input type="number" min="0" value={manualQty} onChange={(e) => setManualQty(e.target.value)} className="qty" aria-label="grams" />
          <span className="muted small">g</span>
        </div>
        <button className="primary">+ Add</button>
      </form>

      <section className="card">
        <div className="row between wrap">
          <div>
            <h2>In Your Kitchen ({inventory.length})</h2>
            {urgentCount > 0 && <span className="small muted" style={{ color: 'var(--amber)' }}>⚠ {urgentCount} item{urgentCount > 1 ? 's' : ''} need early rescue</span>}
          </div>
          <div className="row">
            {inventory.length === 0 && <button className="ghost small" onClick={loadSample}>Load Sample Pantry</button>}
          </div>
        </div>

        {inventory.length > 0 && (
          <div className="chips" style={{ margin: '12px 0 6px' }}>
            <button type="button" className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>All ({inventory.length})</button>
            <button type="button" className={`chip ${filter === 'urgent' ? 'on' : ''}`} onClick={() => setFilter('urgent')}>Use First ({urgentCount})</button>
            <button type="button" className={`chip ${filter === 'safe' ? 'on' : ''}`} onClick={() => setFilter('safe')}>Safe for You</button>
          </div>
        )}

        {inventory.length === 0 && <p className="muted" style={{ padding: '16px 0' }}>Your pantry is empty. Scan a photo or add ingredients above to begin.</p>}
        <ul className="inventory">
          {filtered.map((item, idx) => {
            const d = daysLeft(item.expiry);
            const status = d < 0 ? 'expired' : d <= 1 ? 'red' : d <= 3 ? 'amber' : 'green';
            const safety = checkIngredient(item.name, profile);
            const known = findIngredient(item.name);
            const alias = known?.aliases?.find((a) => !a.startsWith(known.name)); // e.g. Hindi name
            return (
              <li key={item.id} style={{ animationDelay: `${Math.min(idx, 10) * 50}ms` }}>
                <div className="grow">
                  <div className="name">
                    {item.name}
                    {alias && <span className="muted small"> · {alias}</span>}
                  </div>
                  <div className="row small" style={{ marginTop: '4px' }}>
                    <span className={`badge ${status} ${d <= 3 ? 'pulse' : ''}`}>
                      {d < 0 ? 'Expired' : d === 0 ? 'Use today' : d <= 3 ? `Use first · ${d}d` : `${d} days left`}
                    </span>
                    {safety.blocked && <span className="badge red" title={safety.blocked}>Not for you</span>}
                  </div>
                </div>
                <div className="row" style={{ flex: 'none' }}>
                  <input type="number" className="qty" value={item.qty ?? ''} onChange={async (e) => { await store.updateItem(item.id, { qty: Number(e.target.value) }); onChange(); }} aria-label="grams" />
                  <span className="small muted">g</span>
                </div>
                <input type="date" value={item.expiry || ''} onChange={async (e) => { await store.updateItem(item.id, { expiry: e.target.value }); onChange(); }} />
                <button className="icon" aria-label="Remove" onClick={async () => { await store.removeItem(item.id); toast(`${item.name} removed`); onChange(); }}>✕</button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
