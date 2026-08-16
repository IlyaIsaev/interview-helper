import { abortVar, wrap } from '@reatom/core'
import { hc } from 'hono/client'

import type { AppType } from '../../../worker'

export const api = hc<AppType>('/', {
  init: {
    credentials: 'include',
  },
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    const { controller, unsubscribe } = abortVar.subscribe()

    return wrap(
      fetch(input, {
        ...init,
        signal: init?.signal ?? controller.signal,
      }),
    ).finally(() => {
      unsubscribe()
    })
  },
})
