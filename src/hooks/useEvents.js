import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * Fetches events from Supabase.
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

        setEvents(data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load events.");
          setEvents([]);
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
