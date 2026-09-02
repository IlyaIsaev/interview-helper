import { action, computed, withAsync, withAsyncData, wrap } from '@reatom/core'

import { authClient } from './auth-client'

export const session = computed(async () => {
  const authSession = await wrap(authClient.getSession())

  return authSession.data
}, 'session').extend(withAsyncData({ initState: null }))

export const signOut = action(async () => {
  const { error } = await wrap(authClient.signOut())

  if (error) {
    throw new Error(error.message)
  }

  await wrap(session.retry())
}, 'signOut').extend(withAsync())
