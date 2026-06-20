const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", e => errs.push("PE:"+e.message));
  p.on("console", m => { if (m.type()==="error") errs.push("CE:"+m.text()); });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });

  // How many wave canvases are in the Work section, and are they sized?
  const info = await p.evaluate(() => {
    const s = document.querySelector("#work");
    const cv = s ? [...s.querySelectorAll("canvas")] : [];
    return { canvases: cv.length, sizes: cv.map(c => `${c.width}x${c.height}`) };
  });
  console.log("WORK_CANVASES:", JSON.stringify(info));

  // Idle screenshot of the Work section.
  await p.locator("#work").scrollIntoViewIfNeeded();
  await p.waitForTimeout(700);
  await p.screenshot({ path: "scripts/work-waves-idle.png" });

  // Play the hero, then come back to Work to see the waves swell.
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  const play = p.locator('button[aria-label*="Play" i]').first();
  if (await play.count()) await play.click();
  await p.waitForTimeout(1500);
  await p.locator("#work").scrollIntoViewIfNeeded();
  await p.waitForTimeout(1800);
  const energy = await p.evaluate(() => document.documentElement.style.getPropertyValue("--audio-energy"));
  console.log("ENERGY while viewing work:", JSON.stringify(energy));
  await p.screenshot({ path: "scripts/work-waves-playing.png" });

  // Measure cyan pixels in a back-wave canvas to confirm it draws.
  const draws = await p.evaluate(() => {
    const s = document.querySelector("#work");
    const cv = s ? s.querySelector("canvas") : null;
    if (!cv) return null;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    const img = ctx.getImageData(0,0,cv.width,cv.height).data;
    let cyan = 0;
    for (let i = 0; i < img.length; i += 16) if (img[i+1] > 30 && img[i+2] > 30) cyan++;
    return cyan;
  });
  console.log("BACK_WAVE_CYAN_PIXELS:", draws);
  console.log("ERRORS:", JSON.stringify(errs.slice(0,8)));
  await b.close();
})().catch(e => { console.error("FAILED", e); process.exit(1); });
