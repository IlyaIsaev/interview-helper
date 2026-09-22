import { computed, reatomForm, wrap } from "@reatom/core";
import * as v from "valibot";

import { authClient, session } from "@/shared/auth";
import { toast } from "@/shared/ui";

const signInSchema = v.object({
  email: v.pipe(v.string(), v.nonEmpty("Enter an email"), v.email("Enter a valid email")),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Enter a password"),
    v.minLength(8, "Use at least 8 characters"),
  ),
});

export const signInForm = reatomForm(
  {
    email: "",
    password: "",
  },
  {
    name: "signInForm",
    validateOnBlur: true,
    validateOnChange: false,
    schema: signInSchema,
    onSubmit: async ({ email, password }) => {
      const { error } = await wrap(
        authClient.signIn.email({
          email,
          password,
        }),
      );

      if (error) {
        toast.error("This user doesn't exist anymore.");

        throw new Error("This user doesn't exist anymore.");
      }

      await wrap(session.retry());
    },
  },
);

export const isSignInValid = computed(() => {
  const parsedSignIn = v.safeParse(signInSchema, {
    email: signInForm.fields.email(),
    password: signInForm.fields.password(),
  });

  return parsedSignIn.success;
}, "isSignInValid");
