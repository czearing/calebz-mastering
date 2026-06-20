const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3010/", { waitUntil: "networkidle" });
  const freeCount = await p.evaluate(() => (document.body.textContent.match(/first master.{0,12}free|free.{0,12}master/gi) || []).length);
  console.log("free-master mentions on page:", freeCount);
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
