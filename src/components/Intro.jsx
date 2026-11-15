// INTRO SCREEN: a 3D scene of food orbiting a steaming dish.
// How the 3D works (all CSS, see the "INTRO" part of styles.css):
//   - .scene sets `perspective`, which makes far things look smaller.
//   - .ring spins around the Y axis. Each food sits on the ring at its own angle (--a)
//     and is pushed outwards with translateZ, so together they form a circle in 3D space.
//   - Each emoji spins the opposite way at the same speed, so it always faces you.
//   - Moving the mouse / finger tilts the whole stage (the --rx / --ry variables).
import React, { useRef } from 'react';

const FOODS = ['🍅', '🥔', '🧅', '🥬', '🥕', '🌶️', '🍆', '🧄', '🍋', '🥛'];
const OUTER = ['🫛', '🥒', '🍚', '🥚', '🫚', '🌿'];

export default function Intro({ onEnter }) {
  const stage = useRef(null);

  function move(e) {
    const el = stage.current;
    if (!el) return;
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    el.style.setProperty('--ry', `${(x * 36).toFixed(1)}deg`);
    el.style.setProperty('--rx', `${(-y * 22).toFixed(1)}deg`);
  }

  return (
    <div className="intro" onPointerMove={move}>
      <div className="stars" aria-hidden="true" />

      <div className="scene" aria-hidden="true">
        <div className="stage" ref={stage}>
          <div className="plate" />
          <div className="ring">
            {FOODS.map((f, i) => (
              <div className="food" key={f} style={{ '--a': `${(360 / FOODS.length) * i}deg` }}>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="ring outer">
            {OUTER.map((f, i) => (
              <div className="food" key={f} style={{ '--a': `${(360 / OUTER.length) * i}deg` }}>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="dish">
            <i className="steam s1" /><i className="steam s2" /><i className="steam s3" />
            🍲
          </div>
        </div>
      </div>

      <div className="intro-text">
        <p className="eyebrow">The Mindful Culinary Studio</p>
        <h1 className="grand">Rasoi Rescue</h1>
        <p className="lead">Wholesome Indian cooking from what you have — allergy-safe, zero food waste.</p>
        <div className="pills">
          <span>📷 Smart Pantry Vision</span>
          <span>🛡 Verified Health Safety</span>
          <span>🌱 Zero Food Waste</span>
        </div>
        <button className="primary big enter" onClick={onEnter}>Enter Your Kitchen →</button>
      </div>
    </div>
  );
}
