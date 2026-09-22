import { isAbort, reatomField, reatomForm, wrap } from "@reatom/core";
import * as v from "valibot";

import { clientApi } from "@/shared/api";
import { toast } from "@/shared/ui";

const changePasswordSchema = v.object({
  password: v.pipe(
    v.string(),
    v.nonEmpty("Enter a password"),
    v.minLength(8, "Use at least 8 characters"),
    v.maxLength(128, "Use at most 128 characters"),
  ),
  passwordConfirmation: v.pipe(v.string(), v.nonEmpty("Confirm the password")),
});

export const changePasswordForm = reatomForm(
  {
    password: "",
    passwordConfirmation: reatomField("", {
      validate({ state }) {
        if (state === changePasswordForm.fields.password()) return;

        return "Passwords do not match";
      },
    }),
  },
  {
    name: "changePasswordForm",
    validateOnBlur: true,
    validateOnChange: false,
    schema: changePasswordSchema,
    onSubmit: async ({ password }) => {
      try {
        await wrap(clientApi.changePassword({ password }));
      } catch (error) {
        if (isAbort(error)) return;

        toast.error("Could not change the password. Try again later.");

        throw error instanceof Error
          ? error
          : new Error("Could not change the password. Try again later.");
      }

      changePasswordForm.reset();

      toast.success("Password changed.");
    },
  },
);
