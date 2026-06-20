const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const browser = await chromium.launch();
  // 1) Reload 3x, check work card count each time (catch intermittency)
  for (let i = 0; i < 3; i++) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    page.on("pageerror", e => errs.push("PE:" + e.message));
    page.on("console", m => { if (m.type()==="error") errs.push("CE:" + m.text()); });
    await page.goto(BASE + "/?cb=" + i, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const s = document.querySelector("#work");
      const cards = s ? s.querySelectorAll("li").length : -1;
      const vis = s ? getComputedStyle(s).visibility : "n/a";
      const op = s ? getComputedStyle(s).opacity : "n/a";
      // also check the reveal-wrapped heading line opacity
      return { cards, vis, op };
    });
    console.log(`reload#${i}:`, JSON.stringify(r), "errs:", errs.length ? JSON.stringify(errs.slice(0,3)) : "none");
    await page.close();
  }
  // 2) Nav-click path: click WORK in header, screenshot what user sees
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const navWork = page.locator('header a:has-text("Work"), nav a:has-text("Work")').first();
  if (await navWork.count()) { await navWork.click(); await page.waitForTimeout(1200); }
  await page.screenshot({ path: "scripts/nav-work-view.png" });
  const after = await page.evaluate(() => {
    const s = document.querySelector("#work");
    const rect = s.getBoundingClientRect();
    return { cards: s.querySelectorAll("li").length, topInView: rect.top, bottomInView: rect.bottom };
  });
  console.log("NAV_CLICK:", JSON.stringify(after));
  // 3) reduced-motion
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const rm = await page.evaluate(() => document.querySelector("#work").querySelectorAll("li").length);
  console.log("REDUCED_MOTION cards:", rm);
  await browser.close();
})().catch(e => { console.error("FAILED", e); process.exit(1); });
