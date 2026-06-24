import { useState, useEffect } from "react";

/**
 * Animates a number from 0 → target using an ease-out cubic curve.
 *
 * @param {number}  target    - The final numeric value to count up to.
 * @param {boolean} started   - Flip to true to begin the animation.
 * @param {number}  [duration=2000] - Total animation time in ms.
 * @returns {number} Current animated count value.
 */
export function useCounter(target, started, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;

    let frame = 0;
    const total = 60;

    const timer = setInterval(() => {
      frame++;
      const ease = 1 - Math.pow(1 - frame / total, 3);
      setCount(Math.floor(ease * target));
      if (frame >= total) clearInterval(timer);
    }, duration / total);

    return () => clearInterval(timer);
  }, [started, target, duration]);

  return count;
}
