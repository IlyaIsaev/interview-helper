import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";
import { Hono, type Context } from "hono";
import { deleteCookie } from "hono/cookie";
import { csrf } from "hono/csrf";
import * as v from "valibot";

import { createAuth, isTrustedAuthOrigin } from "../auth";
import { createDatabase } from "../db/client";
import { account, session, user as userTable } from "../db/schema";

const BETTER_AUTH_SESSION_TOKEN_COOKIE = "better-auth.session_token";

const changePasswordSchema = v.object({
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password is too short"),
    v.maxLength(128, "Password is too long"),
  ),
});

type UserContext = Context<{ Bindings: Env }>;

type Database = ReturnType<typeof createDatabase>;

const deleteUserById = async (database: Database, userId: string): Promise<void> => {
  await database.delete(session).where(eq(session.userId, userId));

  await database.delete(account).where(eq(account.userId, userId));

  await database.delete(userTable).where(eq(userTable.id, userId));
};

const isHttpsRequest = (context: UserContext): boolean =>
  new URL(context.req.url).protocol === "https:";

const sessionCookieOptions = (context: UserContext) => ({
  path: "/",
  httpOnly: true,
  sameSite: "Lax" as const,
  secure: isHttpsRequest(context),
});

const expireSessionCookies = (context: UserContext) => {
  const cookieOptions = sessionCookieOptions(context);

  deleteCookie(context, BETTER_AUTH_SESSION_TOKEN_COOKIE, cookieOptions);

  deleteCookie(context, BETTER_AUTH_SESSION_TOKEN_COOKIE, {
    ...cookieOptions,
    prefix: "secure",
  });
};

export const user = new Hono<{ Bindings: Env }>()
  .use(
    csrf({
      origin: (origin, context) => isTrustedAuthOrigin(origin, context.env.BETTER_AUTH_URL),
    }),
  )
  .post("/password", vValidator("json", changePasswordSchema), async (context) => {
    const { password } = context.req.valid("json");
    const auth = createAuth(context.env);
    const currentSession = await auth.api.getSession({
      headers: context.req.raw.headers,
    });

    if (!currentSession) return context.json({ message: "Unauthorized" }, 401);

    try {
      const authContext = await auth.$context;
      const hashedPassword = await authContext.password.hash(password);

      await authContext.internalAdapter.updatePassword(currentSession.user.id, hashedPassword);
    } catch {
      return context.json({ message: "Could not change the password" }, 500);
    }

    return context.body(null, 204);
  })
  .delete("/", async (context) => {
    const currentSession = await createAuth(context.env).api.getSession({
      headers: context.req.raw.headers,
    });

    if (!currentSession) return context.json({ message: "Unauthorized" }, 401);

    const database = createDatabase(context.env.DB);

    await deleteUserById(database, currentSession.user.id);

    expireSessionCookies(context);

    return context.body(null, 204);
  });
