import type { FieldAtom } from '@reatom/core'
import { bindField } from '@reatom/react'
import { omit, pipe } from 'es-toolkit/fp'

export const bindFormControl = <State, Value>(
  field: FieldAtom<State, Value>,
): Omit<ReturnType<typeof bindField<Value>>, 'error'> =>
  pipe(bindField(field), omit(['error']))
