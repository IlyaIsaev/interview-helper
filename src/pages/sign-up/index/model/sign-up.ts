import { computed, reatomForm } from '@reatom/core';
import * as v from 'valibot';

import { registerFormSchemaValidation, toast } from '@/shared/ui';

const signUpSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty('Enter a name')),
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

export const signUpForm = reatomForm(
  {
    name: '',
    email: '',
    password: '',
  },
  {
    name: 'signUpForm',
    validateOnBlur: false,
    validateOnChange: false,
    schema: signUpSchema,
    onSubmit: () => {
      toast.error('Sign-up temporarily unavailable.');
    },
  },
);

registerFormSchemaValidation(signUpForm, [
  signUpForm.fields.name,
  signUpForm.fields.email,
  signUpForm.fields.password,
]);

export const isSignUpValid = computed(() => {
  const parsedSignUp = v.safeParse(signUpSchema, {
    name: signUpForm.fields.name(),
    email: signUpForm.fields.email(),
    password: signUpForm.fields.password(),
  });

  return parsedSignUp.success;
}, 'isSignUpValid');
