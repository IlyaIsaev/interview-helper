import { atom, computed, withAsyncData, wrap } from '@reatom/core'
import type { DeepReadonly } from 'es-toolkit/types'

import { clientApi } from '@/shared/api'

export type DemoCredentials = DeepReadonly<{
  email: string
  password: string
}>

export const createdDemoUser = atom<DemoCredentials | null>(
  null,
  'createdDemoUser',
)

export const demoCredentials = computed(async () => {
  return await wrap(clientApi.loadDemoUser())
}, 'demoCredentials').extend(withAsyncData({ initState: null }))
