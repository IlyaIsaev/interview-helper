import { computed } from '@reatom/core'
import { compact, join, map, pipe, take } from 'es-toolkit/fp'
import type { DeepReadonly } from 'es-toolkit/types'

import { session } from '@/shared/auth'

export type User = DeepReadonly<{
  name: string
  initials: string
}>

const firstLetter = (namePart: string): string => namePart[0]

const toUpperCase = (text: string): string => text.toUpperCase()

const buildUserInitials = (name: string): string => {
  const initials = pipe(
    name.split(/\s+/),
    compact(),
    map(firstLetter),
    take(2),
    join(''),
    toUpperCase,
  )

  if (!initials) {
    return '?'
  }

  return initials
}

export const user = computed((): User | null => {
  const name = session.data()?.user?.name

  if (typeof name !== 'string') {
    return null
  }

  return {
    name,
    initials: buildUserInitials(name),
  }
}, 'user')
