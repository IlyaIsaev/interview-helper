import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { signUpForm } from "../../model/sign-up";
import SignUpPage from "../sign-up-page";

test("should not show name validation when the field is blurred without changes", async () => {
  signUpForm.reset();

  const screen = await render(<SignUpPage />);
  const name = screen.getByRole("textbox", { name: "name" });

  await userEvent.click(name);
  await userEvent.keyboard("{Tab}");

  await expect.element(screen.getByText("Enter a name")).not.toBeInTheDocument();
});

test("should show name validation when the field is blurred empty", async () => {
  signUpForm.reset();

  const screen = await render(<SignUpPage />);
  const name = screen.getByRole("textbox", { name: "name" });

  await userEvent.click(name);
  await userEvent.keyboard("a{Backspace}");

  await expect.element(screen.getByText("Enter a name")).not.toBeInTheDocument();

  await userEvent.keyboard("{Tab}");

  await expect.element(screen.getByText("Enter a name")).toBeVisible();
});

test("should enable create account when name, email, and password are valid", async () => {
  signUpForm.reset();

  const screen = await render(<SignUpPage />);
  const createAccount = screen.getByRole("button", { name: "Create account" });

  await expect.element(createAccount).toBeDisabled();

  await userEvent.click(screen.getByRole("textbox", { name: "name" }));
  await userEvent.keyboard("Ada");
  await userEvent.click(screen.getByRole("textbox", { name: "email" }));
  await userEvent.keyboard("ada@example.com");
  await userEvent.click(screen.getByRole("textbox", { name: "password" }));
  await userEvent.keyboard("password1");

  await expect.element(createAccount).toBeEnabled();
});
