import { action, computed, urlAtom, withAsync, withAsyncData, wrap } from "@reatom/core";

import { SIGN_IN_PATH } from "@/shared/config";

import { authClient } from "./auth-client";

export const session = computed(async () => {
  const authSession = await wrap(authClient.getSession());

  return authSession.data;
}, "session").extend(withAsyncData({ initState: null }));

export const isSignedIn = computed(() => Boolean(session.data()?.user), "isSignedIn");

export const signOut = action(async () => {
  const { error } = await wrap(authClient.signOut());

  if (error) throw new Error(error.message);

  await wrap(session.retry());

  urlAtom.go(SIGN_IN_PATH);
}, "signOut").extend(withAsync());
