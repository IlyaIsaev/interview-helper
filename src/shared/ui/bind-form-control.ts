import type { FieldAtom } from '@reatom/core';
import { memoKey, notify, wrap } from '@reatom/core';
import { bindField } from '@reatom/react';
import { omit, pipe } from 'es-toolkit/fp';

import { triggerFieldSchemaValidation } from './form-schema-validation';

type FieldBlurSession = {
  editedDuringFocus: boolean;
};

export const bindFormControl = <TState, TValue>(
  field: FieldAtom<TState, TValue>,
): Omit<ReturnType<typeof bindField<TValue>>, 'error'> => {
  const bound = bindField(field);
  const baseOnFocus = bound.onFocus;
  const baseOnChange = bound.onChange;
  const session = memoKey<FieldBlurSession>(field.name, () => ({
    editedDuringFocus: false,
  }));

  return pipe(bound, omit(['error', 'onBlur', 'onFocus', 'onChange']), (controls) => ({
    ...controls,
    onFocus: wrap((event) => {
      session.editedDuringFocus = false;
      baseOnFocus(event);
    }),
    onChange: wrap((event) => {
      session.editedDuringFocus = true;
      baseOnChange(event);
    }),
    onBlur: wrap(() => {
      field.focus.out();

      if (session.editedDuringFocus || field.focus().dirty) {
        field.validation.trigger();
        triggerFieldSchemaValidation(field);
      }

      notify();
    }),
  }));
};
