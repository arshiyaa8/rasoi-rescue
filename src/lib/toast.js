// TOASTS: small pop-up messages. Any file can call toast('Saved!') and the
// <Toasts /> component (in components/Fx.jsx) shows it for a few seconds.
const listeners = new Set();

export function toast(text, kind = 'ok') {
  const t = { id: Date.now() + Math.random(), text, kind };
  listeners.forEach((fn) => fn(t));
}

export function onToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
