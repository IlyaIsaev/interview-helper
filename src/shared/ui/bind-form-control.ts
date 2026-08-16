import type { FieldAtom } from '@reatom/core'
import { bindField } from '@reatom/react'

export const bindFormControl = <Field extends FieldAtom>(field: Field) => {
  const { error, ...control } = bindField(field)

  void error

  return control
}
