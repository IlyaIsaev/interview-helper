import { expect, test } from "@playwright/test";

import { emptyStorageState } from "./auth";

test.use({ storageState: emptyStorageState });

test("sign-in page does not show cookie consent", async ({ page }) => {
  await page.goto("/sign-in");

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "We use cookies" })).toHaveCount(0);
});
