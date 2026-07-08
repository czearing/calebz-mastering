// Deep mobile audit of the Work track modal (TrackModal). Opens the modal on a
// range of phone viewports and measures whether the dialog clips out of the
// viewport, whether its content overflows without a scroll path, and whether
// the Close and Play controls are actually reachable/visible. Screenshots each.
// Run: PROBE_URL=http://localhost:3002 node scripts/modal-mobile-probe.cjs
const { chromium } = require("playwright");
const fs = require("fs");

const BASE = process.env.PROBE_URL || "http://localhost:3002";
const OUT = process.env.OUT_DIR || "/tmp/modal-shots";

const DEVICES = [
  { name: "iphone-se-1", width: 320, height: 568 },
  { name: "iphone-se-2", width: 375, height: 667 },
  { name: "iphone-12", width: 390, height: 844 },
  { name: "pixel-small", width: 360, height: 640 },
  { name: "landscape", width: 667, height: 375 },
];

async function auditOne(browser, dev) {
  const ctx = await browser.newContext({
    viewport: { width: dev.width, height: dev.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.locator("#work").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  const card = p.locator('#work button[aria-label*="Open before and after" i]').first();
  await card.click();
  await p.waitForTimeout(700); // let the entrance animation settle

  const info = await p.evaluate((vh) => {
    const dlg = document.querySelector("dialog[open]");
    if (!dlg) return { open: false };
    const r = dlg.getBoundingClientRect();
    const cs = getComputedStyle(dlg);
    const q = (sel) => dlg.querySelector(sel);
    const rectOf = (el) => (el ? el.getBoundingClientRect() : null);
    const closeBtn = [...dlg.querySelectorAll("button")].find((b) =>
      /close/i.test(b.getAttribute("aria-label") || ""),
    );
    const playBtn = [...dlg.querySelectorAll("button")].find((b) =>
      /play/i.test(b.getAttribute("aria-label") || ""),
    );
    const inView = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return b.top >= 0 && b.bottom <= vh && b.left >= 0;
    };
    return {
      open: true,
      viewportH: vh,
      dialog: { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), height: +r.height.toFixed(1) },
      overflowsBottom: +(r.bottom - vh).toFixed(1), // >0 means clipped below fold
      overflowsTop: +(0 - r.top).toFixed(1), // >0 means clipped above
      maxHeight: cs.maxHeight,
      overflowY: cs.overflowY,
      scrollHeight: dlg.scrollHeight,
      clientHeight: dlg.clientHeight,
      contentOverflow: dlg.scrollHeight - dlg.clientHeight, // >0 = content taller than box
      scrollable: dlg.scrollHeight > dlg.clientHeight && cs.overflowY !== "visible" && cs.overflowY !== "hidden",
      closeRect: rectOf(closeBtn),
      closeInView: inView(closeBtn),
      playRect: rectOf(playBtn),
      playInView: inView(playBtn),
    };
  }, dev.height);

  fs.mkdirSync(OUT, { recursive: true });
  await p.screenshot({ path: `${OUT}/${dev.name}.png` });
  await ctx.close();
  return info;
}

(async () => {
  const b = await chromium.launch();
  const results = {};
  for (const dev of DEVICES) {
    try {
      results[dev.name] = await auditOne(b, dev);
    } catch (e) {
      results[dev.name] = { error: String(e).slice(0, 200) };
    }
  }
  await b.close();

  console.log("\n=== MODAL MOBILE AUDIT ===");
  for (const [name, r] of Object.entries(results)) {
    if (!r.open) { console.log(`\n[${name}] ${r.error || "modal did not open"}`); continue; }
    const clip = r.overflowsBottom > 0.5 || r.overflowsTop > 0.5;
    const contentClipped = r.contentOverflow > 1 && !r.scrollable;
    console.log(`\n[${name}] viewport ${r.viewportH}px`);
    console.log(`  dialog: top ${r.dialog.top} bottom ${r.dialog.bottom} height ${r.dialog.height}`);
    console.log(`  maxHeight=${r.maxHeight} overflowY=${r.overflowY} scrollable=${r.scrollable}`);
    console.log(`  overflowsBottom=${r.overflowsBottom}px overflowsTop=${r.overflowsTop}px  ${clip ? "❌ CLIPS VIEWPORT" : "✓ fits"}`);
    console.log(`  contentOverflow=${r.contentOverflow}px  ${contentClipped ? "❌ CONTENT CLIPPED (no scroll)" : "✓ ok"}`);
    console.log(`  Close in view: ${r.closeInView}  Play in view: ${r.playInView}`);
  }
  console.log(`\nScreenshots -> ${OUT}`);
})();
