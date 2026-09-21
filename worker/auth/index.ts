import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { Hono } from "hono";

import { createDatabase } from "../db/client";
import * as schema from "../db/schema";

import {
  isAllowedSignUpEmail,
  isLocalAuthUrl,
  LOCAL_DEV_ORIGINS,
  SIGN_UP_EMAIL_NOT_ALLOWED_MESSAGE,
} from "./allowed-sign-up-emails";

export const trustedOriginsFor = (betterAuthUrl: string): Array<string> => {
  const origin = new URL(betterAuthUrl).origin;

  return isLocalAuthUrl(betterAuthUrl) ? [...LOCAL_DEV_ORIGINS] : [origin];
};

export const isTrustedAuthOrigin = (origin: string, betterAuthUrl: string): boolean =>
  trustedOriginsFor(betterAuthUrl).includes(origin);

const isSignUpEmailPath = (path: string): boolean =>
  path === "/sign-up/email" || path === "/api/auth/sign-up/email";

const authForEnv = (env: Env) =>
  betterAuth({
    appName: "interview-helper",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(createDatabase(env.DB), {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: trustedOriginsFor(env.BETTER_AUTH_URL),
    hooks: {
      before: createAuthMiddleware(async (context) => {
        if (!isSignUpEmailPath(context.path)) return;

        const email = context.body?.email;

        if (typeof email !== "string") return;

        if (isAllowedSignUpEmail(email, env.BETTER_AUTH_URL)) return;

        throw new APIError("FORBIDDEN", { message: SIGN_UP_EMAIL_NOT_ALLOWED_MESSAGE });
      }),
    },
    rateLimit: {
      enabled: true,
      customRules: {
        "/sign-up/email": false,
        "/sign-in/email": false,
        "/api/auth/sign-up/email": false,
        "/api/auth/sign-in/email": false,
      },
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
  });

export const createAuth = (env: Env): ReturnType<typeof authForEnv> => authForEnv(env);

export const auth = new Hono<{ Bindings: Env }>().on(["GET", "POST"], "/*", (context) =>
  createAuth(context.env).handler(context.req.raw),
);
