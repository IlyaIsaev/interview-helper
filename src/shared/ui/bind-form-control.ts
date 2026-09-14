import type { FieldAtom } from '@reatom/core';
import { bindField } from '@reatom/react';
import { omit, pipe } from 'es-toolkit/fp';

export const bindFormControl = <TState, TValue>(
  field: FieldAtom<TState, TValue>,
): Omit<ReturnType<typeof bindField<TValue>>, 'error'> =>
  pipe(bindField(field), omit(['error']));
