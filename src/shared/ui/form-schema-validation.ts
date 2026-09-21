import type { FieldAtom } from "@reatom/core";

type SchemaValidationTrigger = () => void;

const triggersByField = new WeakMap<FieldAtom, SchemaValidationTrigger>();

export const registerFieldSchemaValidation = (
  field: FieldAtom,
  trigger: SchemaValidationTrigger,
): void => {
  triggersByField.set(field, trigger);
};

export const triggerFieldSchemaValidation = (field: FieldAtom): void => {
  triggersByField.get(field)?.();
};

export const registerFormSchemaValidation = (
  form: { validation: { triggerSchemaValidation: SchemaValidationTrigger } },
  fields: ReadonlyArray<FieldAtom>,
): void => {
  const trigger = () => form.validation.triggerSchemaValidation();

  for (const field of fields) registerFieldSchemaValidation(field, trigger);
};
