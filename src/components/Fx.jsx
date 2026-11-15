// VISUAL EFFECTS: small reusable pieces for the 3D look and the pop-ups.
// Everything here is plain React + CSS 3D transforms. No extra libraries.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onToast } from '../lib/toast.js';

// Tilt: the card leans towards your finger / mouse, like a real 3D object.
export function Tilt({ as: Tag = 'div', max = 9, className = '', children, ...rest }) {
  const ref = useRef(null);
  function move(e) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 .. 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(6px)`;
  }
  function reset() {
    if (ref.current) ref.current.style.transform = '';
  }
  return (
    <Tag ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={reset} onPointerUp={reset} {...rest}>
      {children}
    </Tag>
  );
}

// Popup: a centred window that swings in with a 3D animation.
export function Popup({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="popup" role="dialog" aria-label={title} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`popup-box stack ${wide ? 'wide' : ''}`}>
        <div className="row between">
          <h2>{title}</h2>
          {onClose && <button type="button" className="icon" onClick={onClose} aria-label="Close">✕</button>}
        </div>
        {children}
      </div>
    </div>
  );
}

// Toasts: the stack of small messages at the top of the screen.
export function Toasts() {
  const [items, setItems] = useState([]);
  useEffect(
    () =>
      onToast((t) => {
        setItems((list) => [...list.slice(-2), t]);
        setTimeout(() => setItems((list) => list.filter((x) => x.id !== t.id)), 3200);
      }),
    [],
  );
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>{t.text}</div>
      ))}
    </div>
  );
}

// Cube: a spinning 3D cube with a food emoji on each face. Used while loading / scanning.
export function Cube({ faces = ['🍅', '🥔', '🥬', '🧅', '🥕', '🌶️'] }) {
  return (
    <div className="cube-wrap" aria-hidden="true">
      <div className="cube">
        {faces.map((f, i) => (
          <div key={i} className={`face f${i}`}>{f}</div>
        ))}
      </div>
    </div>
  );
}

// Confetti: a burst of food emojis flying outwards.
export function Confetti({ count = 26 }) {
  const bits = useMemo(() => {
    const emoji = ['✨', '🌱', '⭐', '🥬', '🌿', '🍅', '💛', '🥕', '🍋'];
    return Array.from({ length: count }, (_, i) => ({
      e: emoji[i % emoji.length],
      x: Math.round((Math.random() - 0.5) * 340),
      y: Math.round(-80 - Math.random() * 240),
      r: Math.round((Math.random() - 0.5) * 720),
      d: (Math.random() * 0.25).toFixed(2),
    }));
  }, [count]);
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span key={i} style={{ '--x': `${b.x}px`, '--y': `${b.y}px`, '--r': `${b.r}deg`, animationDelay: `${b.d}s` }}>{b.e}</span>
      ))}
    </div>
  );
}

// useCountUp: makes a number count up from 0 (used on the Rescue Score tiles).
export function useCountUp(value, ms = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(value * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return v;
}
