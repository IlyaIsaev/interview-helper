import { reatomComponent } from '@reatom/react';
import type { ReactNode } from 'react';

import {
  bindFormControl,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Spinner,
} from '@/shared/ui';

import { changePasswordForm } from '../model/change-password';

type ChangePasswordFormProps = {
  deleteUser: ReactNode;
};

export const ChangePasswordForm = reatomComponent(
  ({ deleteUser }: ChangePasswordFormProps) => {
    const { fields, submit, validation } = changePasswordForm;
    const isSubmitReady = submit.ready();
    const hasValidationErrors = validation().errors.length > 0;
    const passwordField = bindFormControl(fields.password);
    const passwordConfirmationField = bindFormControl(fields.passwordConfirmation);

    return (
      <Form onSubmit={submit}>
        <FormField field={fields.password}>
          <FormItem>
            <FormLabel>new password</FormLabel>
            <FormControl>
              <Input
                type="password"
                autoComplete="new-password"
                {...passwordField}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField field={fields.passwordConfirmation}>
          <FormItem>
            <FormLabel>new password confirmation</FormLabel>
            <FormControl>
              <Input
                type="password"
                autoComplete="new-password"
                {...passwordConfirmationField}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <div className="flex items-center justify-between gap-2">
          {deleteUser}
          <Button type="submit" disabled={!isSubmitReady || hasValidationErrors}>
            {!isSubmitReady ? <Spinner data-icon="inline-start" /> : null}
            Change password
          </Button>
        </div>
      </Form>
    );
  },
  'ChangePasswordForm',
);
