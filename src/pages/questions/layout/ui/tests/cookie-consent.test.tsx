import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { cookieConsent } from "../../model/cookie-consent";
import { CookieConsent } from "../cookie-consent";

const clearCookieConsent = () => {
  document.cookie = "cookieConsent=; path=/; max-age=-1";
  cookieConsent.set(false);
};

afterEach(clearCookieConsent);

test("should show the consent banner when cookies are not accepted", async () => {
  clearCookieConsent();

  const screen = await render(<CookieConsent />);

  await expect.element(screen.getByRole("heading", { name: "We use cookies" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Accept" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Decline" })).toBeVisible();
});

test("should hide the consent banner when cookies are already accepted", async () => {
  cookieConsent.set(true);

  const screen = await render(<CookieConsent />);

  await expect
    .element(screen.getByRole("heading", { name: "We use cookies" }))
    .not.toBeInTheDocument();
});

test("should persist consent and hide the banner when Accept is clicked", async () => {
  clearCookieConsent();

  const screen = await render(<CookieConsent />);

  await userEvent.click(screen.getByRole("button", { name: "Accept" }));

  await expect
    .element(screen.getByRole("heading", { name: "We use cookies" }))
    .not.toBeInTheDocument();
  expect(document.cookie).toContain("cookieConsent=true");
});
