import { test } from "@playwright/test";

test.describe("Project flow", () => {
  test("placeholder", async ({ page }) => {
    // In a real environment you would automate login and project creation.
    await page.goto("/login");
  });
});
