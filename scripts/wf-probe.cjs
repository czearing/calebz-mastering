const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", e => errs.push("PE:"+e.message));
  p.on("console", m => { if (m.type()==="error") errs.push("CE:"+m.text()); });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.locator("#work").scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  await p.locator('button[aria-label*="We Should Go Back" i]').first().click();
  await p.waitForTimeout(900);

  // Waveform height
  const wfBox = await p.evaluate(() => {
    const svg = document.querySelector('dialog svg');
    const r = svg ? svg.getBoundingClientRect() : null;
    return r ? { h: Math.round(r.height), w: Math.round(r.width) } : null;
  });
  console.log("WAVEFORM_SVG:", JSON.stringify(wfBox));

  // ensure on BEFORE side, screenshot
  const beforeBtn = p.locator('dialog button:has-text("Before")').first();
  if (await beforeBtn.count()) await beforeBtn.click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: "scripts/wf-before.png" });

  // ---- resume-after-finish test ----
  await p.locator('dialog button[aria-label*="Play" i]').first().click();
  await p.waitForTimeout(800);
  const slider = p.locator('dialog [role="slider"]').first();
  const sb = await slider.boundingBox();
  // seek near the very end
  await p.mouse.click(sb.x + sb.width * 0.985, sb.y + sb.height/2);
  // wait for it to finish
  await p.waitForTimeout(2500);
  const endedTime = await p.evaluate(() => {
    const t = [...document.querySelectorAll('dialog *')].map(e=>e.textContent).find(s=>/\d:\d\d \/ \d:\d\d/.test(s||""));
    return t ? t.match(/\d:\d\d \/ \d:\d\d/)[0] : null;
  });
  // now seek to middle and see if it resumes
  await p.mouse.click(sb.x + sb.width * 0.3, sb.y + sb.height/2);
  await p.waitForTimeout(400);
  const t1 = await p.evaluate(() => { const t=[...document.querySelectorAll('dialog *')].map(e=>e.textContent).find(s=>/\d:\d\d \/ \d:\d\d/.test(s||"")); return t? t.match(/\d:\d\d \/ \d:\d\d/)[0]:null; });
  await p.waitForTimeout(1200);
  const t2 = await p.evaluate(() => { const t=[...document.querySelectorAll('dialog *')].map(e=>e.textContent).find(s=>/\d:\d\d \/ \d:\d\d/.test(s||"")); return t? t.match(/\d:\d\d \/ \d:\d\d/)[0]:null; });
  console.log("AT_END:", endedTime, "AFTER_SEEK t1:", t1, "t2:", t2, "RESUMED:", t1 !== t2);
  console.log("ERRORS:", JSON.stringify(errs.slice(0,6)));
  await b.close();
})().catch(e=>{console.error("FAILED",e);process.exit(1)});
