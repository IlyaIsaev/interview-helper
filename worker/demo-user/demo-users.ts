import { and, eq, like, lte } from 'drizzle-orm';
import { filter, map, pipe } from 'es-toolkit/fp';

import { createDatabase } from '../db/client';
import { account, session, user } from '../db/schema';

export const DEMO_USER_EMAIL_PATTERN = /^demo-user-[a-f0-9]{8}@demo\.com$/;

export const DEMO_USER_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const MAX_QUESTIONS_FOR_DEMO_USER = 100;

export const MAX_QUESTIONS_PER_USER = 200;

type Database = ReturnType<typeof createDatabase>;

type DemoUserRow = {
  id: string;
  email: string;
  createdAt: Date;
};

export const isDemoUserEmail = (email: string): boolean =>
  DEMO_USER_EMAIL_PATTERN.test(email);

export const maxQuestionsForEmail = (email: string): number =>
  isDemoUserEmail(email) ? MAX_QUESTIONS_FOR_DEMO_USER : MAX_QUESTIONS_PER_USER;

export const questionLimitMessage = (email: string): string =>
  isDemoUserEmail(email)
    ? 'Demo accounts are limited to 100 questions'
    : 'Question limit reached';

export const isDemoUserExpired = (createdAt: Date, now = new Date()): boolean =>
  now.getTime() - createdAt.getTime() >= DEMO_USER_MAX_AGE_MS;

export const deleteUserById = async (
  database: Database,
  userId: string,
): Promise<void> => {
  await database.delete(session).where(eq(session.userId, userId));

  await database.delete(account).where(eq(account.userId, userId));

  await database.delete(user).where(eq(user.id, userId));
};

const isExpiredDemoUser = (now: Date) => (demoUser: DemoUserRow): boolean =>
  isDemoUserEmail(demoUser.email) && isDemoUserExpired(demoUser.createdAt, now);

export const deleteExpiredDemoUsers = async (
  database: Database,
  now = new Date(),
): Promise<void> => {
  const cutoff = new Date(now.getTime() - DEMO_USER_MAX_AGE_MS);
  const foundUsers = await database
    .select({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(and(like(user.email, 'demo-user-%@demo.com'), lte(user.createdAt, cutoff)));

  const expiredDemoUsers = pipe(foundUsers, filter(isExpiredDemoUser(now)));
  const deleteExpiredDemoUser = (expiredUser: DemoUserRow) =>
    deleteUserById(database, expiredUser.id);

  await Promise.all(pipe(expiredDemoUsers, map(deleteExpiredDemoUser)));
};
