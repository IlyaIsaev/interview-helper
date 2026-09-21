import { expect, test } from "vitest";

import { CATALOG_OWNER_EMAIL, isAllowedSignUpEmail } from "./allowed-sign-up-emails";

const localAuthUrl = "http://127.0.0.1:5173";
const productionAuthUrl = "https://interview-helper.iaisaev.workers.dev";

test("should allow the listed email ignoring case and surrounding whitespace", () => {
  expect(isAllowedSignUpEmail(CATALOG_OWNER_EMAIL, productionAuthUrl)).toBe(true);
  expect(isAllowedSignUpEmail("  IAISAEV@PM.ME  ", localAuthUrl)).toBe(true);
});

test("should allow example.com addresses on a local Better Auth URL", () => {
  expect(isAllowedSignUpEmail("e2e-123@example.com", localAuthUrl)).toBe(true);
  expect(isAllowedSignUpEmail("e2e-123@example.com", "http://localhost:5173")).toBe(true);
});

test("should reject example.com addresses on a production Better Auth URL", () => {
  expect(isAllowedSignUpEmail("e2e-123@example.com", productionAuthUrl)).toBe(false);
});

test("should reject unrelated emails on local and production URLs", () => {
  expect(isAllowedSignUpEmail("not-allowed@gmail.com", localAuthUrl)).toBe(false);
  expect(isAllowedSignUpEmail("not-allowed@gmail.com", productionAuthUrl)).toBe(false);
});
