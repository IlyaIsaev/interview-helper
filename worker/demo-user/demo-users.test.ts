import { expect, test } from 'vitest';

import {
  isDemoUserEmail,
  isDemoUserExpired,
  maxQuestionsForEmail,
  questionLimitMessage,
} from './demo-users';

test('demo emails match the generated demo-user pattern', () => {
  expect(isDemoUserEmail('demo-user-abcd1234@demo.com')).toBe(true);

  expect(isDemoUserEmail('user@example.com')).toBe(false);

  expect(isDemoUserEmail('demo-user-abcd123@demo.com')).toBe(false);
});

test('demo emails are capped at 100 questions', () => {
  expect(maxQuestionsForEmail('demo-user-abcd1234@demo.com')).toBe(100);

  expect(maxQuestionsForEmail('user@example.com')).toBe(200);

  expect(questionLimitMessage('demo-user-abcd1234@demo.com')).toBe(
    'Demo accounts are limited to 100 questions',
  );

  expect(questionLimitMessage('user@example.com')).toBe('Question limit reached');
});

test('a demo user is expired 24 hours after create', () => {
  const createdAt = new Date('2026-09-06T12:00:00.000Z');

  expect(isDemoUserExpired(createdAt, new Date('2026-09-07T11:59:59.999Z'))).toBe(
    false,
  );

  expect(isDemoUserExpired(createdAt, new Date('2026-09-07T12:00:00.000Z'))).toBe(
    true,
  );
});
