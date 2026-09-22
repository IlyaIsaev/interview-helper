import { wrap } from "@reatom/core";
import { reatomComponent } from "@reatom/react";

import { profileRoute, questionsRoute, signInRoute, theoryRoute } from "@/app/routes";
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui";

import { signOutToSignIn, user } from "../model/user";

export const UserMenu = reatomComponent(() => {
  const { name, initials } = user() ?? { name: "", initials: "" };

  if (!name) {
    return (
      <Button asChild variant="ghost">
        <a href={signInRoute.path()}>Sign in</a>
      </Button>
    );
  }

  const handleLogOut = wrap(signOutToSignIn);

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
          <a href={questionsRoute.path()}>Questions</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={theoryRoute.path()}>Theory</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={profileRoute.path()}>Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!signOutToSignIn.ready()} onClick={handleLogOut}>
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}, "UserMenu");
