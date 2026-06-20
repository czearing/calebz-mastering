const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + "/start?tracks=3&stems=1", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.screenshot({ path: "scripts/co-review.png" });
  // continue to pay
  const cont = p.locator('button:has-text("Continue to pay")').first();
  if (await cont.count()) { await cont.click(); await p.waitForTimeout(600); }
  await p.screenshot({ path: "scripts/co-pay.png" });
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
