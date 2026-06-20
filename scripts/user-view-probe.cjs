// Reproduce EXACTLY what the user sees: scroll the A/B player to the center of
// the viewport (where they look), press play, and screenshot the real viewport
// (not full page) for BEFORE and AFTER, so we see if the field is visible there.
const { chromium } = require("playwright");
const URL = process.env.PROBE_URL || "http://localhost:3010/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERR:" + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("ERR:" + m.text()); });

  await page.goto(URL, { waitUntil: "networkidle" });

  // Center the play button in the viewport, like a user scrolling to it.
  const play = page.locator('button[aria-label*="Play" i]').first();
  await play.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -120)); // nudge so field center sits near player
  await page.waitForTimeout(400);
  await play.click();
  await page.waitForTimeout(2500);

  const measure = async (tag) => {
    const s = await page.evaluate(() => {
      const energy = getComputedStyle(document.documentElement).getPropertyValue("--audio-energy").trim();
      const width = getComputedStyle(document.documentElement).getPropertyValue("--audio-width").trim();
      const canvas = document.querySelector("canvas");
      const layer = canvas ? canvas.parentElement : null;
      // What is the brightest cyan pixel currently visible in the viewport band?
      let visibleCyan = 0;
      if (canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const w = canvas.width, h = canvas.height;
        const img = ctx.getImageData(0, 0, w, h).data;
        for (let i = 0; i < img.length; i += 32) {
          if (img[i + 1] > 40 && img[i + 2] > 40) visibleCyan++;
        }
      }
      return {
        energy, width,
        layerOpacity: layer ? getComputedStyle(layer).opacity : null,
        visibleCyan,
      };
    });
    console.log(tag, JSON.stringify(s));
  };

  await measure("BEFORE:");
  await page.screenshot({ path: "scripts/user-before.png" }); // viewport only
  // Toggle to After (the wide master).
  const after = page.locator('button[aria-label="After"], button:has-text("After")').first();
  if (await after.count()) await after.click();
  await page.waitForTimeout(3500);
  await measure("AFTER:");
  await page.screenshot({ path: "scripts/user-after.png" });

  console.log("ERRORS:", JSON.stringify(errors.slice(0, 8)));
  await browser.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
