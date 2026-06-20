const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", e => errs.push("PE:"+e.message));
  p.on("console", m => { if (m.type()==="error") errs.push("CE:"+m.text()); });
  await p.goto("http://localhost:3010/", { waitUntil: "networkidle" });
  await p.locator("#work").scrollIntoViewIfNeeded();
  await p.waitForTimeout(600);
  const info = await p.evaluate(() => {
    const s = document.querySelector("#work");
    return { cards: s.querySelectorAll("li").length, canvases: s.querySelectorAll("canvas").length };
  });
  console.log("WORK:", JSON.stringify(info), "ERRORS:", JSON.stringify(errs.slice(0,5)));
  await p.screenshot({ path: "scripts/reverted-work.png" });
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
