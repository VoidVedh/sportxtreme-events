import { useState, useEffect } from "react";

/**
 * Returns true once the referenced element enters the viewport.
 * Disconnects the observer after first intersection (fire-once).
 *
 * @param {React.RefObject} ref        - Ref attached to the element to observe.
 * @param {number}          [threshold=0.2] - Intersection ratio to trigger (0–1).
 * @returns {boolean} Whether the element is (or has been) in view.
 */
export function useInView(ref, threshold = 0.2) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) obs.observe(ref.current);

    return () => obs.disconnect();
  }, [ref, threshold]);

  return inView;
}
