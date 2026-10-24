import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * Fetches events from Supabase.
 */
export function useEvents({ limit = null } = {}) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = () => setReloadKey((prev) => prev + 1);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("events")
          .select("id, title, category, sport, description, location, participants, event_date, image_url, status, created_at")
          .order("created_at", { ascending: false });

        if (limit) query = query.limit(limit);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out")), 4000)
        );
        const { data, error: dbError } = await Promise.race([query, timeoutPromise]);

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
  }, [limit, reloadKey]);

  return { events, loading, error, refetch };
}
