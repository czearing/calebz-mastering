// Hard look at the Selected Work section: does it render? Console errors?
// Card count/sizes? Plus the section min-height behavior when filtering.
const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERR: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()); });
  page.on("requestfailed", (r) => errors.push("REQFAIL: " + r.url() + " " + (r.failure() && r.failure().errorText)));

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const work = await page.evaluate(() => {
    const s = document.querySelector("#work");
    if (!s) return { exists: false };
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    const cards = s.querySelectorAll("li");
    const imgs = [...s.querySelectorAll("img")].map((im) => ({
      src: im.getAttribute("src"),
      natW: im.naturalWidth, natH: im.naturalHeight,
      shown: im.getBoundingClientRect().width > 0 && im.getBoundingClientRect().height > 0,
    }));
    const grid = s.querySelector("ul");
    const gr = grid ? grid.getBoundingClientRect() : null;
    return {
      exists: true,
      sectionHeight: Math.round(r.height),
      opacity: cs.opacity,
      display: cs.display,
      visibility: cs.visibility,
      cardCount: cards.length,
      gridHeight: gr ? Math.round(gr.height) : null,
      gridChildren: grid ? grid.children.length : 0,
      firstCardText: cards[0] ? cards[0].textContent.replace(/\s+/g, " ").trim().slice(0, 60) : null,
      imgs,
      innerHTMLlen: s.innerHTML.length,
    };
  });
  console.log("WORK:", JSON.stringify(work, null, 2));

  await page.locator("#work").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "scripts/work-section.png" });

  // Filter min-height behavior: click a genre, measure grid height before/after.
  const beforeH = await page.evaluate(() => {
    const u = document.querySelector("#work ul"); return u ? Math.round(u.getBoundingClientRect().height) : null;
  });
  const pill = page.locator('#work button[aria-pressed]').nth(1);
  if (await pill.count()) {
    await pill.click();
    await page.waitForTimeout(500);
  }
  const afterH = await page.evaluate(() => {
    const u = document.querySelector("#work ul"); return u ? Math.round(u.getBoundingClientRect().height) : null;
  });
  console.log("FILTER_HEIGHT: before=" + beforeH + " after=" + afterH);
  await page.screenshot({ path: "scripts/work-filtered.png" });

  console.log("ERRORS:", JSON.stringify(errors.slice(0, 15), null, 2));
  await browser.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
