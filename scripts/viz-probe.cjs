// Real playback probe for the page audio field (goniometer).
// Loads the home page, clicks the hero play button, then samples the canvas
// pixels, the --audio-energy CSS var, and the live stereo read over time.
const { chromium } = require("playwright");

const URL = process.env.PROBE_URL || "http://localhost:3010/";

(async () => {
  const browser = await chromium.launch({
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--use-fake-ui-for-media-stream",
      "--mute-audio",
    ],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const logs = [];
  page.on("console", (m) => logs.push("PAGE:" + m.type() + ":" + m.text()));
  page.on("pageerror", (e) => logs.push("PAGEERROR:" + e.message));

  await page.goto(URL, { waitUntil: "networkidle" });

  // List candidate play buttons for diagnostics.
  const buttons = await page.$$eval("button", (els) =>
    els.map((b) => (b.getAttribute("aria-label") || b.textContent || "").trim()).filter(Boolean),
  );
  console.log("BUTTONS:", JSON.stringify(buttons.slice(0, 20)));

  // Click the first play control (PlayButton carries the play label).
  const playBtn = page.locator('button[aria-label*="Hear" i], button[aria-label*="play" i]').first();
  const count = await playBtn.count();
  console.log("playBtn count:", count);
  if (count > 0) {
    await playBtn.click();
  } else {
    // Fallback: click first button inside the Hear-the-difference section.
    await page.locator('section[aria-label*="Hear" i] button').first().click();
  }

  // Measure the canvas: cyan pixel count and the horizontal extent of the drawn
  // cloud (the goniometer's stereo width). Returns the half-width as a fraction
  // of canvas width so before/after are comparable.
  const measure = () =>
    page.evaluate(() => {
      const out = {};
      out.energy = getComputedStyle(document.documentElement)
        .getPropertyValue("--audio-energy")
        .trim();
      const canvas = document.querySelector("canvas");
      out.hasCanvas = !!canvas;
      if (canvas) {
        const parent = canvas.parentElement;
        out.layerOpacity = getComputedStyle(parent).opacity;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          const w = canvas.width, h = canvas.height;
          const img = ctx.getImageData(0, 0, w, h).data;
          let cyan = 0, minX = w, maxX = 0;
          for (let y = 0; y < h; y += 2) {
            for (let x = 0; x < w; x += 2) {
              const i = (y * w + x) * 4;
              if (img[i + 1] > 24 && img[i + 2] > 24) {
                cyan++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
              }
            }
          }
          out.cyanPixels = cyan;
          out.cw = w;
          out.widthFrac = cyan > 0 ? +(((maxX - minX) / w)).toFixed(3) : 0;
        }
      }
      return out;
    });

  // Let it play, sample the BEFORE side.
  await page.waitForTimeout(2500);
  const before = await measure();
  console.log("BEFORE_SIDE:", JSON.stringify(before));
  await page.screenshot({ path: "scripts/viz-before.png" });

  // Switch to AFTER (the wider master) and sample again.
  const afterToggle = page.locator('button[aria-label="After"], button:has-text("After")').first();
  if (await afterToggle.count()) await afterToggle.click();
  await page.waitForTimeout(3000);
  const after = await measure();
  console.log("AFTER_SIDE:", JSON.stringify(after));
  await page.screenshot({ path: "scripts/viz-after.png" });

  // Characterize the real hero audio stereo width via Web Audio directly.
  const widthProbe = await page.evaluate(async () => {
    try {
      const res = await fetch("/audio/for-me-after.mp3");
      const buf = await res.arrayBuffer();
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const audio = await ac.decodeAudioData(buf);
      const ch = audio.numberOfChannels;
      if (ch < 2) return { channels: ch, note: "mono file: goniometer has no width to show" };
      const L = audio.getChannelData(0), R = audio.getChannelData(1);
      let side = 0, mid = 0, n = Math.min(L.length, 200000);
      for (let i = 0; i < n; i++) {
        const s = (L[i] - R[i]) * 0.5, m = (L[i] + R[i]) * 0.5;
        side += s * s; mid += m * m;
      }
      return {
        channels: ch,
        sideRms: Math.sqrt(side / n).toFixed(5),
        midRms: Math.sqrt(mid / n).toFixed(5),
        sideToMid: (Math.sqrt(side / n) / (Math.sqrt(mid / n) || 1e-9)).toFixed(4),
      };
    } catch (e) {
      return { error: String(e) };
    }
  });
  console.log("WIDTH_PROBE:", JSON.stringify(widthProbe));

  await page.screenshot({ path: "scripts/viz-playing.png" });
  console.log("LOGS:", JSON.stringify(logs.slice(-15)));
  await browser.close();
})().catch((e) => {
  console.error("PROBE_FAILED", e);
  process.exit(1);
});
