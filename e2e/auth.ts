import { expect, type Page, type Response } from "@playwright/test";

export const signedInPath = /\/questions(\/[0-9a-f-]+)?$/;

export const e2eUserName = "Ada";

export const emptyStorageState = { cookies: [], origins: [] };

export const acceptedCookieConsentStorageState = {
  cookies: [
    {
      name: "cookieConsent",
      value: "true",
      domain: "127.0.0.1",
      path: "/",
      expires: -1,
      httpOnly: false,
      secure: false,
      sameSite: "Lax" as const,
    },
  ],
  origins: [],
};

const SIGN_UP_EMAIL_PATH = "/api/auth/sign-up/email";

export type CreatedAccount = {
  name: string;
  email: string;
  password: string;
};

const RATE_LIMIT_WINDOW_MS = 10_000;

const isOnSignedInPage = (page: Page) => signedInPath.test(page.url());

const isSignUpEmailPost = (response: Response) => {
  if (response.request().method() !== "POST") return false;

  return new URL(response.url()).pathname === SIGN_UP_EMAIL_PATH;
};

const waitForSignUpResponse = (page: Page) =>
  page.waitForResponse(isSignUpEmailPost, { timeout: 20_000 });

const waitForRateLimitWindow = async (response: Response) => {
  const retryAfterSeconds = Number(response.headers()["x-retry-after"]);
  const waitMs =
    Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds * 1_000
      : RATE_LIMIT_WINDOW_MS;

  await new Promise((resolve) => {
    setTimeout(resolve, waitMs + 250);
  });
};

export const signInWithCredentials = async (page: Page, credentials: CreatedAccount) => {
  if (isOnSignedInPage(page)) {
    await expect(page.getByRole("button", { name: credentials.name })).toBeVisible();

    return;
  }

  await page.getByLabel("email").fill(credentials.email);
  await page.getByLabel("password").fill(credentials.password);

  const signInButton = page.getByRole("button", { name: "Sign in" });

  await expect(signInButton).toBeEnabled();
  await signInButton.click();

  await expect(page).toHaveURL(signedInPath, { timeout: 15_000 });
  await expect(page.getByRole("button", { name: credentials.name })).toBeVisible();
};

const signInAfterDuplicateSignUp = async (page: Page, credentials: CreatedAccount) => {
  if (isOnSignedInPage(page)) {
    await expect(page.getByRole("button", { name: credentials.name })).toBeVisible();

    return;
  }

  await page.goto("/sign-in");
  await signInWithCredentials(page, credentials);
};

const waitUntilSignedIn = async (page: Page, credentials: CreatedAccount) => {
  try {
    await expect(page).toHaveURL(signedInPath, { timeout: 10_000 });
  } catch {
    await page.goto("/questions");
    await expect(page).toHaveURL(signedInPath, { timeout: 15_000 });
  }

  await expect(page.getByRole("button", { name: credentials.name })).toBeVisible();
};

const clickCreateAccount = async (page: Page) => {
  const createAccountButton = page.getByRole("button", { name: "Create account" });

  await expect(createAccountButton).toBeEnabled();

  try {
    const responsePromise = waitForSignUpResponse(page);
    await createAccountButton.click();

    return await responsePromise;
  } catch {
    const responsePromise = waitForSignUpResponse(page);
    await page.getByLabel("password").press("Enter");

    return await responsePromise;
  }
};

const submitSignUpOnce = async (
  page: Page,
  credentials: CreatedAccount,
  retries: number,
): Promise<void> => {
  const response = await clickCreateAccount(page);
  const status = response.status();

  if (status === 429 && retries > 0) {
    await waitForRateLimitWindow(response);

    return submitSignUpOnce(page, credentials, retries - 1);
  }

  if (status === 200) {
    await waitUntilSignedIn(page, credentials);

    return;
  }

  if (status === 422) {
    await signInAfterDuplicateSignUp(page, credentials);

    return;
  }

  throw new Error(`sign-up failed: ${status}`);
};

export const submitSignUp = async (page: Page, credentials: CreatedAccount) => {
  await submitSignUpOnce(page, credentials, 2);
};

export const createAccount = async (page: Page): Promise<CreatedAccount> => {
  const name = e2eUserName;
  const email = `e2e-${crypto.randomUUID()}@example.com`;
  const password = "password1";
  const credentials = { name, email, password };

  await page.goto("/sign-up");

  await page.getByLabel("name").fill(name);
  await page.getByLabel("email").fill(email);
  await page.getByLabel("password").fill(password);

  await submitSignUp(page, credentials);

  await expect(page.getByRole("button", { name })).toBeVisible();

  return credentials;
};

export const openUserMenu = async (page: Page, name = e2eUserName) => {
  await expect(async () => {
    await page.getByRole("button", { name }).click();
    await expect(page.getByRole("menuitem", { name: "Profile" })).toBeVisible({
      timeout: 2_000,
    });
  }).toPass({ timeout: 15_000 });
};
