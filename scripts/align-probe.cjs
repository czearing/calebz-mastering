const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", e => errs.push("PE:"+e.message));
  p.on("console", m => { if (m.type()==="error") errs.push("CE:"+m.text()); });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  const proc = await p.evaluate(() => document.querySelector("#process").getBoundingClientRect().top + window.scrollY);
  await p.evaluate((y) => window.scrollTo(0, y), proc - 250);
  await p.waitForTimeout(450);
  const m = await p.evaluate(() => {
    const ol = document.querySelector("#process ol");
    const cx = el => { const r=el.getBoundingClientRect(); return {cx:Math.round(r.left+r.width/2), cy:Math.round(r.top+r.height/2)}; };
    const railEl = ol.querySelector("span:not(.border)"); // dim rail
    const dots = [...ol.querySelectorAll("span.border")].map(cx);
    const head = [...ol.querySelectorAll(":scope > span")].find(s=>s.className.includes("z-10"));
    const nums = [...ol.querySelectorAll("li span.font-mono")];
    return {
      railCx: cx(railEl).cx,
      headCx: head?cx(head).cx:null, headCy: head?cx(head).cy:null,
      dotCxs: dots.map(d=>d.cx), dotCys: dots.map(d=>d.cy),
      numCys: nums.map(n=>cx(n).cy),
      lit: nums.map(n=>+getComputedStyle(n).opacity.slice(0,4)),
    };
  });
  console.log("ALIGN:", JSON.stringify(m));
  await p.screenshot({ path: "scripts/process-aligned.png" });
  // also screenshot a bit lower (step 3-4)
  await p.evaluate((y) => window.scrollTo(0, y), proc + 120);
  await p.waitForTimeout(400);
  await p.screenshot({ path: "scripts/process-aligned2.png" });
  console.log("ERRORS:", JSON.stringify(errs.slice(0,5)));
  await b.close();
})().catch(e => { console.error("FAILED", e); process.exit(1); });
