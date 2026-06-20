"use client";

import { useEffect, useState } from "react";

// A useState that mirrors its value to localStorage under `key`, so a reload
// restores it. SSR-safe: the first render always returns `initial` (matching
// the server), then a mount effect hydrates from storage. Writes are gated on a
// `hydrated` flag so the initial value never clobbers a stored one. Pass an
// undefined key to opt out entirely (tests, stories), leaving a plain useState.
// Only non-sensitive, JSON-serializable values belong here. See plan/32.
export function usePersisted<T>(key: string | undefined, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (key) {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw != null) setValue(JSON.parse(raw) as T);
      } catch {
        // Ignore quota or parse errors; fall back to the in-memory value.
      }
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated || !key) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore write failures (private mode, quota); state still works.
    }
  }, [hydrated, key, value]);

  return [value, setValue] as const;
}
