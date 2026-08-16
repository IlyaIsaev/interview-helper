import { computed } from '@reatom/core'

import { session } from '@/shared/auth'

type HomeUser = {
  name: string
  email: string
}

type HomeScreen =
  | { kind: 'loading' }
  | { kind: 'signed-in'; user: HomeUser }

export const home = computed((): HomeScreen => {
  if (!session.ready()) {
    return { kind: 'loading' }
  }

  const currentUser = session.data()?.user

  if (!currentUser) {
    return { kind: 'loading' }
  }

  return {
    kind: 'signed-in',
    user: {
      name: currentUser.name,
      email: currentUser.email,
    },
  }
}, 'home')
