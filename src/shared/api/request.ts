import { abortVar, wrap } from '@reatom/core'

export const requestJson = async <Payload>(
  url: string,
  init?: RequestInit,
): Promise<Payload> => {
  const { controller, unsubscribe } = abortVar.subscribe()

  try {
    const response = await wrap(
      fetch(url, {
        ...init,
        signal: init?.signal ?? controller.signal,
      }),
    )

    if (!response.ok) {
      throw new Error(
        `${init?.method ?? 'GET'} ${url} failed: ${response.status}`,
      )
    }

    return await wrap(response.json() as Promise<Payload>)
  } finally {
    unsubscribe()
  }
}
