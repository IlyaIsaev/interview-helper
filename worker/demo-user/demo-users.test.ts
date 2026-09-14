import { expect, test } from 'vitest';

import {
  isDemoUserEmail,
  isDemoUserExpired,
  maxQuestionsForEmail,
  questionLimitMessage,
} from './demo-users';

test('should match the generated pattern when the email is a demo user', () => {
  expect(isDemoUserEmail('demo-user-abcd1234@demo.com')).toBe(true);

  expect(isDemoUserEmail('user@example.com')).toBe(false);

  expect(isDemoUserEmail('demo-user-abcd123@demo.com')).toBe(false);
});

test('should cap questions at 100 when the email is a demo user', () => {
  expect(maxQuestionsForEmail('demo-user-abcd1234@demo.com')).toBe(100);

  expect(maxQuestionsForEmail('user@example.com')).toBe(200);

  expect(questionLimitMessage('demo-user-abcd1234@demo.com')).toBe(
    'Demo accounts are limited to 100 questions',
  );

  expect(questionLimitMessage('user@example.com')).toBe('Question limit reached');
});

test('should treat a demo user as expired when 24 hours have passed since create', () => {
  const createdAt = new Date('2026-09-06T12:00:00.000Z');

  expect(isDemoUserExpired(createdAt, new Date('2026-09-07T11:59:59.999Z'))).toBe(
    false,
  );

  expect(isDemoUserExpired(createdAt, new Date('2026-09-07T12:00:00.000Z'))).toBe(
    true,
  );
});
