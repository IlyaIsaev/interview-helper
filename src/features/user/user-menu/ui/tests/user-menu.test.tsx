import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import { UserMenu } from "../user-menu";

test("should show a sign in link when the user is unregistered", async () => {
  const screen = await render(<UserMenu />);

  await expect.element(screen.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Ada" })).not.toBeInTheDocument();
});
