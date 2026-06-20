const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  const proc = await p.evaluate(() => document.querySelector("#process").getBoundingClientRect().top + window.scrollY);
  const results = [];
  // sample several scroll depths through the active region
  for (const off of [-150, -50, 50, 150, 300]) {
    await p.evaluate((y) => window.scrollTo(0, y), proc + off);
    await p.waitForTimeout(250);
    const r = await p.evaluate(() => {
      const ol = document.querySelector("#process ol");
      const head = [...ol.querySelectorAll(":scope > span")].find(s=>s.className.includes("z-10"));
      const hr = head.getBoundingClientRect();
      const center = window.innerHeight/2;
      const headCy = hr.top + hr.height/2;
      const first = ol.querySelector("li span.font-mono").getBoundingClientRect();
      const last = [...ol.querySelectorAll("li span.font-mono")].pop().getBoundingClientRect();
      const firstCy = first.top+first.height/2, lastCy = last.top+last.height/2;
      // playhead is "free" (not clamped) only when center is between first and last dot
      const clamped = center < firstCy - 1 || center > lastCy + 1;
      return { headCy: +headCy.toFixed(2), center, delta: +(headCy - center).toFixed(2), clamped };
    });
    results.push(r);
  }
  console.log(JSON.stringify(results, null, 1));
  await b.close();
})().catch(e => { console.error("FAILED", e); process.exit(1); });
