// APP SHELL: shows the 3D intro, loads data once, keeps it in state, and switches between the 4 screens.
import React, { useEffect, useState } from 'react';
import { DEMO, hasSupabase } from './lib/config.js';
import * as store from './lib/store.js';
import { toast } from './lib/toast.js';
import Intro from './components/Intro.jsx';
import Profile from './components/Profile.jsx';
import Kitchen from './components/Kitchen.jsx';
import Recipes from './components/Recipes.jsx';
import CookMode from './components/CookMode.jsx';
import Impact from './components/Impact.jsx';
import { Cube, Toasts } from './components/Fx.jsx';

const TABS = [
  { id: 'kitchen', label: 'Kitchen', icon: '🧺' },
  { id: 'recipes', label: 'Recipes', icon: '🍲' },
  { id: 'impact', label: 'Rescue', icon: '🌱' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [tab, setTab] = useState('kitchen');
  const [profile, setProfile] = useState(store.DEFAULT_PROFILE);
  const [inventory, setInventory] = useState([]);
  const [log, setLog] = useState([]);
  const [cooking, setCooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [p, inv, l] = await Promise.all([store.loadProfile(), store.loadInventory(), store.loadRescueLog()]);
        setProfile(p);
        setInventory(inv);
        setLog(l);
        if (!p.name) setTab('profile'); // first visit -> set up profile first
      } catch (e) {
        setError(`Could not load data: ${e.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refreshInventory() {
    setInventory(await store.loadInventory());
  }

  if (showIntro) return <Intro onEnter={() => setShowIntro(false)} />;
  if (loading) return <div className="center"><Cube /><p>Loading your kitchen…</p></div>;

  return (
    <div className="app">
      <Toasts />
      <header className="topbar">
        <div className="logo-wrapper">
          <span className="logo" aria-hidden="true">🍲</span>
          <div>
            <h1 className="grand small-grand">Rasoi Rescue</h1>
            <p className="tagline">{profile.name ? `Namaste, ${profile.name} · Kitchen Studio` : 'The Mindful Culinary AI'}</p>
          </div>
        </div>
        <span className={`badge ${DEMO ? 'amber' : 'green'}`}>
          <span style={{ fontSize: '0.55rem', marginRight: '4px' }}>●</span>
          {DEMO ? 'Demo Mode' : hasSupabase ? 'Cloud Sync' : 'Local Device'}
        </span>
      </header>

      {error && <div className="alert red">{error}</div>}

      {/* key={tab} makes React rebuild this block on every tab change, which replays the 3D entrance animation */}
      <main key={tab} className="page">
        {tab === 'profile' && (
          <Profile
            profile={profile}
            onSave={async (p) => {
              await store.saveProfile(p);
              setProfile(p);
              toast('✓ Profile saved. Every recipe will be checked against it.');
              setTab('kitchen');
            }}
          />
        )}
        {tab === 'kitchen' && <Kitchen inventory={inventory} profile={profile} onChange={refreshInventory} />}
        {tab === 'recipes' && <Recipes inventory={inventory} profile={profile} onCook={setCooking} />}
        {tab === 'impact' && <Impact log={log} />}
      </main>

      {cooking && (
        <CookMode
          recipe={cooking}
          inventory={inventory}
          onClose={() => setCooking(null)}
          onDone={async () => {
            await refreshInventory();
            setLog(await store.loadRescueLog());
          }}
        />
      )}

      <p className="disclaimer">
        Rasoi Rescue supports general nutrition decisions only. It does not diagnose, prescribe diets or replace
        doctors and dietitians. Always double-check labels for allergens.
      </p>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
