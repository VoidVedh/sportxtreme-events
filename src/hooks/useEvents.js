import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { MOCK_EVENTS } from "../data/mockEvents";

/**
 * Fetches events from Supabase with graceful fallback to mock data.
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
        let query = supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false });

        if (limit) query = query.limit(limit);

        const { data, error: dbError } = await query;

        if (cancelled) return;
        if (dbError) throw dbError;

        const result = data && data.length > 0
          ? data
          : limit ? MOCK_EVENTS.slice(0, limit) : MOCK_EVENTS;

        setEvents(result);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load events.");
          setEvents(limit ? MOCK_EVENTS.slice(0, limit) : MOCK_EVENTS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEvents();
    return () => { cancelled = true; };
  }, [limit]);

  return { events, loading, error };
}
