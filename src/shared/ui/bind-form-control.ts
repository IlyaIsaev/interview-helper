import type { FieldAtom } from '@reatom/core';
import { wrap } from '@reatom/core';
import { bindField } from '@reatom/react';
import { omit, pipe } from 'es-toolkit/fp';

export const bindFormControl = <TState, TValue>(
  field: FieldAtom<TState, TValue>,
): Omit<ReturnType<typeof bindField<TValue>>, 'error'> => {
  const bound = bindField(field);
  const baseOnBlur = bound.onBlur;

  return pipe(bound, omit(['error', 'onBlur']), (controls) => ({
    ...controls,
    onBlur: wrap(() => {
      baseOnBlur();

      if (field.focus().dirty) field.validation.trigger();
    }),
  }));
};
