import { test, expect } from "@playwright/test";

// Home loads: hero visible, no console errors. See plan/20 flow table.
test("home loads with hero and no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Hear the difference." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
