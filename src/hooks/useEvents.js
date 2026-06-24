import { useState, useEffect } from "react";
import { MOCK_EVENTS } from "../data/mockEvents";

/**
 * Fetches events from mock data.
 * Falls back gracefully with loading / error / empty states.
 */
export function useEvents({ limit = null } = {}) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      setLoading(true);
      setError(null);

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (cancelled) return;

        let data = [...MOCK_EVENTS];
        if (limit) data = data.slice(0, limit);

        setEvents(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load events.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEvents();
    return () => { cancelled = true; };
  }, [limit]);

  return { events, loading, error };
}
