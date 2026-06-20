const { chromium } = require("playwright");
const BASE = process.env.PROBE_URL || "http://localhost:3010";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  // hero CTA label + target
  const hero = await p.evaluate(() => {
    const a = [...document.querySelectorAll("a")].find(x => /start a master/i.test(x.textContent));
    const book = [...document.querySelectorAll("a,button")].filter(x => /^book$/i.test(x.textContent.trim())).length;
    return { heroCta: a ? a.textContent.trim() : null, heroHref: a ? a.getAttribute("href") : null, bookLabelsRemaining: book };
  });
  console.log("HERO:", JSON.stringify(hero));
  // section order
  const order = await p.evaluate(() => [...document.querySelectorAll("section[id]")].map(s => s.id));
  console.log("ORDER:", JSON.stringify(order));
  // services section screenshot (free banner + console)
  await p.locator("#services").scrollIntoViewIfNeeded();
  await p.evaluate(() => window.scrollBy(0, -80));
  await p.waitForTimeout(400);
  await p.screenshot({ path: "scripts/services-new.png" });
  const free = await p.evaluate(() => {
    const s = document.querySelector("#services");
    const t = s ? s.textContent : "";
    return { hasFreeBanner: /first master.*free|first time/i.test(t), hasFirstMasterFreeInConsole: /first master free/i.test(t) };
  });
  console.log("FREE:", JSON.stringify(free));
  await b.close();
})().catch(e => { console.error("FAILED", e); process.exit(1); });
