/** Map Supabase / PostgREST errors to user-facing copy. */
export function formatSubmitError(err) {
  if (!err) return "Something went wrong. Please try again.";
  const message = err.message || String(err);
  if (err.code === "42501" || message.includes("row-level security")) {
    return "We couldn't save your submission right now. Please email us at sportxtremeevents@gmail.com or call +91 8976571622.";
  }
  if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
    return "Network error. Check your connection and try again.";
  }
  return message;
}
