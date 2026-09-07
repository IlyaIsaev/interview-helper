import { action, reatomForm, wrap } from '@reatom/core';
import * as v from 'valibot';

import { clientApi } from '@/shared/api';
import {
  authClient,
  createdDemoUser,
  session,
  type DemoCredentials,
} from '@/shared/auth';
import { toast } from '@/shared/ui';

const DEMO_USER_EMAIL_PATTERN = /^demo-user-[a-f0-9]{8}@demo\.com$/;

const isDemoEmail = (email: string): boolean => DEMO_USER_EMAIL_PATTERN.test(email);

const signInSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty('Enter an email'),
    v.email('Enter a valid email'),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Enter a password'),
    v.minLength(8, 'Use at least 8 characters'),
  ),
});

export const signInForm = reatomForm(
  {
    email: '',
    password: '',
  },
  {
    name: 'signInForm',
    validateOnBlur: true,
    validateOnChange: false,
    schema: signInSchema,
    onSubmit: async ({ email, password }) => {
      if (isDemoEmail(email)) {
        await wrap(clientApi.createDemoUser({ email, password }));

        await wrap(session.retry());

        toast.info('Demo accounts are deleted after 24 hours.');

        return;
      }

      const { error } = await wrap(
        authClient.signIn.email({
          email,
          password,
        }),
      );

      if (error) {
        toast.error("This user doesn't exist anymore.");

        return;
      }

      await wrap(session.retry());
    },
  },
);

export const initSignIn = action((credentials: DemoCredentials) => {
  createdDemoUser.set(credentials);

  signInForm.fields.email.change(credentials.email);

  signInForm.fields.password.change(credentials.password);
}, 'initSignIn');
