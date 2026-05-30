import { useEffect, useRef, useState } from 'react';

/**
 * Anima un número desde el valor previo al nuevo (easing easeOutCubic).
 * Útil para saldos premium.
 */
export function useCountUp(target = 0, duration = 900) {
  const [value, setValue] = useState(target);
  const prev = useRef(target);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = Number(target) || 0;
    if (from === to) {
      setValue(to);
      return;
    }
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (to - from) * eased;
      setValue(v);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prev.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}
