const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", e => errs.push("PE:"+e.message));
  p.on("console", m => { if (m.type()==="error") errs.push("CE:"+m.text()); });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.locator("#work").scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await p.locator('button[aria-label*="We Should Go Back" i]').first().click();
  await p.waitForTimeout(900);
  await p.locator('dialog button[aria-label*="Play" i]').first().click();
  await p.waitForTimeout(2500);

  const measure = async () => p.evaluate(() => {
    const dlg = document.querySelector("dialog[open]");
    const cv = dlg ? dlg.querySelector("canvas") : null;
    if (!cv) return { canvas: false };
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    const w = cv.width, h = cv.height;
    const img = ctx.getImageData(0,0,w,h).data;
    let cyan=0, minX=w, maxX=0;
    for (let y=0;y<h;y+=2) for (let x=0;x<w;x+=2){ const i=(y*w+x)*4; if(img[i+1]>30&&img[i+2]>30){cyan++; if(x<minX)minX=x; if(x>maxX)maxX=x;} }
    return { canvas:true, w, cyan, widthFrac: cyan>0 ? +(((maxX-minX)/w).toFixed(3)) : 0 };
  });

  console.log("BEFORE:", JSON.stringify(await measure()));
  await p.screenshot({ path: "scripts/modal-before.png" });
  const after = p.locator('dialog button[aria-label="After"], dialog button:has-text("After")').first();
  if (await after.count()) await after.click();
  await p.waitForTimeout(3500);
  console.log("AFTER:", JSON.stringify(await measure()));
  await p.screenshot({ path: "scripts/modal-after.png" });
  console.log("ERRORS:", JSON.stringify(errs.slice(0,6)));
  await b.close();
})().catch(e=>{console.error("FAILED",e);process.exit(1)});
