import { computed } from '@reatom/core'

import { session } from '@/shared/auth'

export type User = {
  name: string
  initials: string
}

const buildUserInitials = (name: string) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (!initials) {
    return '?'
  }

  return initials
}

export const currentUser = computed((): User | null => {
  const user = session.data()?.user

  if (!user) {
    return null
  }

  return {
    name: user.name,
    initials: buildUserInitials(user.name),
  }
}, 'currentUser')
