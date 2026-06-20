const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs=[]; p.on("pageerror",e=>errs.push("PE:"+e.message)); p.on("console",m=>{if(m.type()==="error")errs.push("CE:"+m.text())});
  await p.goto(BASE + "/start?tracks=3&stems=1", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const stepText = async () => p.evaluate(()=>{const t=document.body.textContent;return (t.match(/Step \d of \d/)||[])[0]||null;});
  console.log("REVIEW step:", await stepText());
  await p.screenshot({ path: "scripts/cw-1review.png" });
  await p.locator('button:has-text("Continue")').first().click(); await p.waitForTimeout(500);
  console.log("UPLOAD step:", await stepText());
  // does dropzone show stem-aware copy?
  const stemCopy = await p.evaluate(()=>{const d=document.body.textContent; return /Multiple files per track/.test(d)? "stem-copy" : (/One file per track/.test(d)?"flat-copy":"none");});
  console.log("dropzone copy:", stemCopy);
  await p.screenshot({ path: "scripts/cw-2upload.png" });
  // fill name/email, continue
  await p.fill('input[name="name"], #name, input[type="text"]', "Maya").catch(()=>{});
  await p.fill('input[type="email"]', "maya@studio.com").catch(()=>{});
  await p.waitForTimeout(300);
  const cont = p.locator('button:has-text("Continue to payment")').first();
  if (await cont.count()) await cont.click(); await p.waitForTimeout(500);
  console.log("PAY step:", await stepText());
  const trust = await p.evaluate(()=>({identity:/paying CalebZ/.test(document.body.textContent), free:/first master is free/.test(document.body.textContent)}));
  console.log("PAY trust:", JSON.stringify(trust));
  await p.screenshot({ path: "scripts/cw-3pay.png" });
  console.log("ERRORS:", JSON.stringify(errs.slice(0,5)));
  await b.close();
})().catch(e=>{console.error("FAILED",e);process.exit(1)});
