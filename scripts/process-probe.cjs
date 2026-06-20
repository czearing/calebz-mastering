const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", e => errs.push("PE:"+e.message));
  p.on("console", m => { if (m.type()==="error") errs.push("CE:"+m.text()); });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });

  const flowAt = async () => p.evaluate(() => {
    const ol = document.querySelector("#process ol");
    if (!ol) return null;
    const flow = getComputedStyle(ol).getPropertyValue("--flow").trim();
    // playhead dot position
    const dot = ol.querySelector('span[style*="100%"]');
    const lis = [...ol.querySelectorAll("li")];
    const litNums = lis.map(li => {
      const num = li.querySelector("span.font-mono");
      return num ? +getComputedStyle(num).opacity.slice(0,4) : null;
    });
    return { flow, litNums };
  });

  // Bring process near the top, then sample at a few scroll depths.
  const proc = await p.evaluate(() => document.querySelector("#process").getBoundingClientRect().top + window.scrollY);
  const samples = [];
  for (const frac of [-0.2, 0.1, 0.4, 0.8]) {
    await p.evaluate((y) => window.scrollTo(0, y), proc - 450 + frac * 700);
    await p.waitForTimeout(350);
    samples.push({ at: frac, ...(await flowAt()) });
  }
  console.log("FLOW_SAMPLES:", JSON.stringify(samples, null, 1));

  // Screenshot mid-scroll (signal partway)
  await p.evaluate((y) => window.scrollTo(0, y), proc - 250);
  await p.waitForTimeout(400);
  await p.screenshot({ path: "scripts/process-mid.png" });
  await p.evaluate((y) => window.scrollTo(0, y), proc + 120);
  await p.waitForTimeout(400);
  await p.screenshot({ path: "scripts/process-full.png" });
  console.log("ERRORS:", JSON.stringify(errs.slice(0,6)));
  await b.close();
})().catch(e => { console.error("FAILED", e); process.exit(1); });
