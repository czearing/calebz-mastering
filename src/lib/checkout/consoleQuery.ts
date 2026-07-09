import type { ConsoleAddonState } from "./console";

function clampCount(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

export function toQueryString(
  trackCount: number,
  addons: ConsoleAddonState,
): string {
  const params = new URLSearchParams();
  params.set("tracks", String(Math.max(1, clampCount(trackCount))));
  if (addons.stems) params.set("stems", "1");
  if (addons.rush) params.set("rush", "1");
  if (addons.extraRevision) params.set("extraRevision", "1");
  const alt = clampCount(addons.altVersion);
  if (alt > 0) params.set("altVersion", String(alt));
  const fmt = clampCount(addons.extraFormat);
  if (fmt > 0) params.set("extraFormat", String(fmt));
  if (addons.atmos) params.set("atmos", "1");
  return params.toString();
}

function flag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function count(value: string | undefined): number {
  return clampCount(Number(value ?? 0));
}

export function parseQuery(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
): { trackCount: number; addons: ConsoleAddonState } {
  const get = (key: string): string | undefined => {
    if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
    const raw = input[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  return {
    trackCount: Math.max(1, count(get("tracks")) || 1),
    addons: {
      stems: flag(get("stems")),
      rush: flag(get("rush")),
      extraRevision: flag(get("extraRevision")),
      altVersion: count(get("altVersion")),
      extraFormat: count(get("extraFormat")),
      atmos: flag(get("atmos")),
    },
  };
}
