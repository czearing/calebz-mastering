// Locks page scroll while a modal is open so the background cannot scroll or be
// interacted with (the native <dialog> traps focus and blocks pointer via the
// backdrop, but it does not stop page scroll or the Lenis smooth scroller). We
// stop Lenis if registered and hide overflow so neither native nor smooth scroll
// moves the background. Reference counted so nested or rapid locks are safe.

type Scroller = { stop: () => void; start: () => void } | null;

let scroller: Scroller = null;
let count = 0;
let prevOverflow = "";

// ScrollProvider registers the active Lenis instance here (or null when off).
export function registerScroller(s: Scroller) {
  scroller = s;
}

// No scrollbar-width compensation needed: globals.css sets scrollbar-gutter:
// stable on html, so the gutter is always reserved and hiding overflow does not
// shift the page.
export function lockScroll() {
  if (typeof document === "undefined") return;
  if (count++ > 0) return;
  scroller?.stop();
  const el = document.documentElement;
  prevOverflow = el.style.overflow;
  el.style.overflow = "hidden";
}

export function unlockScroll() {
  if (typeof document === "undefined") return;
  if (count > 0) count--;
  if (count > 0) return;
  document.documentElement.style.overflow = prevOverflow;
  scroller?.start();
}
