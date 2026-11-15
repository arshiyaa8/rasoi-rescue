// RESCUE SCORE DASHBOARD
import React from 'react';
import { totals, RESCUE_WINDOW_DAYS } from '../lib/rescue.js';
import { Tilt, useCountUp } from './Fx.jsx';

export default function Impact({ log }) {
  const t = totals(log);
  const kg = useCountUp(t.kgRescued);
  const money = useCountUp(t.money);
  const meals = useCountUp(t.meals);
  return (
    <div className="stack">
      <section className="tiles">
        <Tilt className="tile" max={16}><div className="tile-icon">🌱</div><div className="big-number">{kg.toFixed(2)}</div><div className="small">kg food rescued</div></Tilt>
        <Tilt className="tile" max={16}><div className="tile-icon">💰</div><div className="big-number">₹{Math.round(money)}</div><div className="small">estimated saved</div></Tilt>
        <Tilt className="tile" max={16}><div className="tile-icon">🍽</div><div className="big-number">{Math.round(meals)}</div><div className="small">meals cooked</div></Tilt>
      </section>

      <section className="card small">
        <h3 style={{ fontSize: '1.05rem', color: 'var(--gold-light)', marginBottom: '6px' }}>The Rescue Score Philosophy</h3>
        <p>
          Ingredients cooked within {RESCUE_WINDOW_DAYS} days of shelf-life expiry count towards your Rescue Score, preventing avoidable domestic food waste.
          Money saved is computed using Indian agricultural market baseline retail prices.
        </p>
      </section>

      <section className="card">
        <h2>Rescue Log & Heritage Meals ({log.length})</h2>
        {log.length === 0 && (
          <div className="center-text muted" style={{ padding: '24px 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌱</div>
            <p>Your culinary journey starts with your first recipe.</p>
            <p className="small">Cook a suggested dish to record your food waste reduction achievements.</p>
          </div>
        )}
        <ul className="history">
          {log.map((e) => (
            <li key={e.id}>
              <div className="row between">
                <strong style={{ fontSize: '1.02rem', color: 'var(--ink)' }}>{e.recipe_title}</strong>
                <span className="small muted">{new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="small muted" style={{ marginTop: '4px' }}>
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>{e.kg_rescued} kg rescued</span> · <span style={{ color: 'var(--gold-light)' }}>₹{e.money_saved} saved</span> · used {(e.items || []).map((i) => i.name).join(', ')}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
