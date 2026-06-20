// Verify the seeded checkout: step numbering, track names, total visibility,
// and that Back does not reveal the console's builder steps.
const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERR:" + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("ERR:" + m.text()); });

  await page.goto(BASE + "/start?tracks=5&stems=1", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const snap = async () => page.evaluate(() => {
    const txt = document.body.textContent;
    const stepTag = (txt.match(/Step\s+\d+\s+of\s+\d+/i) || [])[0] || null;
    const heading = (document.querySelector("h1,h2") || {}).textContent || null;
    // Is a total visible within the viewport (not clipped)?
    let totalVisible = null, totalText = null;
    document.querySelectorAll("*").forEach((el) => {
      if (/total/i.test(el.textContent) && el.children.length <= 3 && !totalText) {
        const m = el.textContent.match(/\$[\d,]+(\.\d+)?/);
        if (m) {
          const r = el.getBoundingClientRect();
          totalVisible = r.top >= 0 && r.bottom <= window.innerHeight + 2;
          totalText = el.textContent.replace(/\s+/g, " ").trim().slice(0, 60);
        }
      }
    });
    const trackNames = [...txt.matchAll(/Track\s+\d+/g)].map((m) => m[0]).slice(0, 8);
    const hasUntitled = /Untitled track/.test(txt);
    return { stepTag, heading, totalVisible, totalText, trackNames, hasUntitled };
  });

  console.log("REVIEW:", JSON.stringify(await snap(), null, 2));
  await page.screenshot({ path: "scripts/review-step.png" });

  // Continue to the pay step, confirm "Step 2 of 3".
  const cont = page.locator('button:has-text("Continue"), button:has-text("Pay"), a:has-text("Continue")').first();
  if (await cont.count()) {
    await cont.click();
    await page.waitForTimeout(700);
    console.log("PAY:", JSON.stringify(await snap()));
    await page.screenshot({ path: "scripts/pay-step.png" });
  }

  console.log("ERRORS:", JSON.stringify(errors.slice(0, 8)));
  await browser.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
