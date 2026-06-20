const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.locator("#work").scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  // open "We Should Go Back"
  const card = p.locator('button[aria-label*="We Should Go Back" i]').first();
  console.log("card found:", await card.count());
  await card.click();
  await p.waitForTimeout(900);
  // play inside modal
  const play = p.locator('dialog button[aria-label*="Play" i]').first();
  console.log("modal play found:", await play.count());
  if (await play.count()) { await play.click(); await p.waitForTimeout(2500); }
  // does a stereo-field canvas exist INSIDE the dialog?
  const info = await p.evaluate(() => {
    const dlg = document.querySelector("dialog[open]");
    const dlgCanvas = dlg ? dlg.querySelectorAll("canvas").length : -1;
    const pageCanvas = document.querySelector("canvas");
    const pageLayer = pageCanvas ? pageCanvas.parentElement : null;
    return {
      dialogOpen: !!dlg,
      canvasInsideDialog: dlgCanvas,
      pageFieldOpacity: pageLayer ? getComputedStyle(pageLayer).opacity : null,
      pageFieldZ: pageLayer ? getComputedStyle(pageLayer).zIndex : null,
    };
  });
  console.log("MODAL:", JSON.stringify(info));
  await p.screenshot({ path: "scripts/modal-playing.png" });
  await b.close();
})().catch(e => { console.error("FAILED", e); process.exit(1); });
