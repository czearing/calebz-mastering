// Real interaction probe for the new Services "Console" order builder.
// Drives the stepper across tier thresholds, toggles an add-on, reads the live
// total at each step, then follows the CTA into /start and verifies hydration.
const { chromium } = require("playwright");
const URL = process.env.PROBE_URL || "http://localhost:3010/";

const dollars = (s) => {
  const m = (s || "").match(/\$[\d,]+(\.\d+)?/);
  return m ? m[0] : null;
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERR:" + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("CONSOLE_ERR:" + m.text());
  });

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.locator("#services").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Identify the controls inside the services section.
  const section = page.locator("#services");
  const btns = await section.locator("button").evaluateAll((els) =>
    els.map((b) => (b.getAttribute("aria-label") || b.textContent || "").trim()),
  );
  console.log("SECTION_BUTTONS:", JSON.stringify(btns));

  // The total lives in an aria-live region; capture it by reading the section text
  // for a $ figure, and also the live region content if present.
  const readState = async () => {
    return await section.evaluate((el) => {
      const live = el.querySelector('[aria-live]');
      const tier = el.querySelector('[aria-current="true"], [aria-current]');
      return {
        liveText: live ? live.textContent.trim() : null,
        sectionHasDollar: /\$[\d,]+/.test(el.textContent),
        // grab the biggest $ figure heuristically (the total)
        dollarMatches: (el.textContent.match(/\$[\d,]+(\.\d+)?/g) || []),
        activeTier: tier ? tier.textContent.replace(/\s+/g, " ").trim().slice(0, 40) : null,
      };
    });
  };

  const plus = section.locator('button[aria-label*="Add" i], button[aria-label*="increase" i], button[aria-label*="more" i]').first();
  const plusCount = await plus.count();
  console.log("plus-button count:", plusCount);

  const steps = [];
  steps.push({ at: "initial", ...(await readState()) });

  // Click + up to 6 times, sampling after each.
  for (let i = 0; i < 6; i++) {
    if (await plus.count()) {
      await plus.click();
      await page.waitForTimeout(500);
      steps.push({ at: "after_+" + (i + 1), ...(await readState()) });
    }
  }
  console.log("STEPPER_STATES:", JSON.stringify(steps, null, 2));

  await page.screenshot({ path: "scripts/console-desktop.png", fullPage: false });

  // Toggle the first add-on and read the total delta.
  const beforeAddon = await readState();
  const toggle = section.locator('button[aria-pressed], [role="switch"]').first();
  let addonResult = "no-toggle-found";
  if (await toggle.count()) {
    await toggle.click();
    await page.waitForTimeout(500);
    const afterAddon = await readState();
    addonResult = {
      before: beforeAddon.dollarMatches,
      after: afterAddon.dollarMatches,
    };
  }
  console.log("ADDON_TOGGLE:", JSON.stringify(addonResult));

  // Follow the CTA into /start.
  const cta = section.locator('a[href*="/start"]').first();
  const ctaHref = (await cta.count()) ? await cta.getAttribute("href") : null;
  console.log("CTA_HREF:", ctaHref);
  if (await cta.count()) {
    await cta.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);
    const startState = await page.evaluate(() => {
      const txt = document.body.textContent;
      return {
        url: location.href,
        dollarMatches: (txt.match(/\$[\d,]+(\.\d+)?/g) || []).slice(0, 8),
        hasSummaryWord: /summary|cart|order|review/i.test(txt),
        heading: (document.querySelector("h1, h2") || {}).textContent || null,
      };
    });
    console.log("START_AFTER_CTA:", JSON.stringify(startState));
    await page.screenshot({ path: "scripts/console-start-hydrated.png", fullPage: false });
  }

  // Mobile sticky bar check.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.locator("#services").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "scripts/console-mobile.png", fullPage: false });

  console.log("ERRORS:", JSON.stringify(errors.slice(0, 12)));
  await browser.close();
})().catch((e) => {
  console.error("PROBE_FAILED", e);
  process.exit(1);
});
