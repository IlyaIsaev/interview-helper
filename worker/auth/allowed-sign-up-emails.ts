export const LOCAL_DEV_ORIGINS = ["http://127.0.0.1:5173", "http://localhost:5173"] as const;

export const CATALOG_OWNER_EMAIL = "iaisaev@pm.me";

export const ALLOWED_SIGN_UP_EMAILS: ReadonlyArray<string> = [CATALOG_OWNER_EMAIL];

export const SIGN_UP_EMAIL_NOT_ALLOWED_MESSAGE = "This email is not allowed to register.";

const LOCAL_EXAMPLE_EMAIL_SUFFIX = "@example.com";

export const isLocalAuthUrl = (betterAuthUrl: string): boolean => {
  const origin = new URL(betterAuthUrl).origin;

  return origin === LOCAL_DEV_ORIGINS[0] || origin === LOCAL_DEV_ORIGINS[1];
};

export const isAllowedSignUpEmail = (email: string, betterAuthUrl: string): boolean => {
  const normalizedEmail = email.trim().toLowerCase();

  if (ALLOWED_SIGN_UP_EMAILS.includes(normalizedEmail)) return true;

  return isLocalAuthUrl(betterAuthUrl) && normalizedEmail.endsWith(LOCAL_EXAMPLE_EMAIL_SUFFIX);
};
