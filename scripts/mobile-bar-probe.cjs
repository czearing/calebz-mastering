// Verify that on mobile, while the Services console is on screen, the console's
// own live-total checkout bar owns the bottom and the global BOOK bar yields.
const { chromium } = require("playwright");
const URL = process.env.PROBE_URL || "http://localhost:3010/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(URL, { waitUntil: "networkidle" });

  // Scroll so the services console fills the viewport and its sticky bar pins.
  await page.locator("#services").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 220));
  await page.waitForTimeout(500);

  const bottomBars = await page.evaluate(() => {
    const h = window.innerHeight;
    const out = [];
    document.querySelectorAll("a,button,div").forEach((el) => {
      const r = el.getBoundingClientRect();
      // Elements pinned near the bottom edge, wide, and visible.
      if (r.bottom > h - 4 && r.bottom < h + 60 && r.width > 200 && r.height > 20) {
        const cs = getComputedStyle(el);
        if (cs.opacity !== "0" && cs.visibility !== "hidden") {
          out.push({
            tag: el.tagName,
            text: el.textContent.replace(/\s+/g, " ").trim().slice(0, 40),
            pos: cs.position,
            opacity: cs.opacity,
            ariaHidden: el.getAttribute("aria-hidden"),
          });
        }
      }
    });
    return out;
  });
  console.log("BOTTOM_BARS:", JSON.stringify(bottomBars, null, 2));

  // Is the global BOOK bar hidden while services is in view?
  const bookBar = await page.evaluate(() => {
    const a = [...document.querySelectorAll("a")].find(
      (x) => /^book$/i.test(x.textContent.trim()),
    );
    if (!a) return "no-book-link";
    const bar = a.closest("div[aria-hidden]");
    return bar ? { ariaHidden: bar.getAttribute("aria-hidden"), opacity: getComputedStyle(bar).opacity } : "no-wrapper";
  });
  console.log("BOOK_BAR:", JSON.stringify(bookBar));

  await page.screenshot({ path: "scripts/mobile-console-bar.png", fullPage: false });
  await browser.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
