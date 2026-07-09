// Normalized progress through the first viewport. The terrain completes its raw
// to master morph while it is still visible, rather than over the whole page.
export function readProgress(): number {
  if (typeof window === "undefined") return 0;
  const height = window.innerHeight || 1;
  return Math.min(1, Math.max(0, window.scrollY / height));
}
