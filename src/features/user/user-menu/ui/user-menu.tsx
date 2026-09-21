import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";

import { signOut } from "@/shared/auth";
import { PROFILE_PATH, QUESTIONS_PATH, SIGN_IN_PATH, THEORY_PATH } from "@/shared/config";
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui";

import { user } from "../model/user";

export const UserMenu = reatomComponent(() => {
  const { name, initials } = user() ?? { name: "", initials: "" };

  if (!name) {
    return (
      <Button asChild variant="ghost">
        <a href={SIGN_IN_PATH}>Sign in</a>
      </Button>
    );
  }

  const handleLogOut = wrap(signOut);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="sr-only">{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={QUESTIONS_PATH}>Questions</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={THEORY_PATH}>Theory</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={PROFILE_PATH}>Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!signOut.ready()} onClick={handleLogOut}>
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}, "UserMenu");
