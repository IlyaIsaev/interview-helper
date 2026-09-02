import { abortVar, wrap } from '@reatom/core'
import { toMerged } from 'es-toolkit'
import { hc } from 'hono/client'
import type { InferRequestType, InferResponseType } from 'hono/client'

import type { AppType } from '../../../worker'

const api = hc<AppType>('/', {
  init: {
    credentials: 'include',
  },
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    const { controller, unsubscribe } = abortVar.subscribe()

    return wrap(
      fetch(
        input,
        toMerged(init ?? {}, {
          signal: init?.signal ?? controller.signal,
        }),
      ),
    ).finally(() => {
      unsubscribe()
    })
  },
})

const readJson = async <T>(
  response: Response,
  failedMessage: string,
): Promise<T> => {
  if (!response.ok) {
    throw new Error(`${failedMessage}: ${response.status}`)
  }

  return await wrap(response.json())
}

type QuestionsResponse = InferResponseType<typeof api.api.questions.$get, 200>

type QuestionResponse = InferResponseType<(typeof api.api.questions)[':id']['$get'], 200>

type CreateQuestionBody = InferRequestType<typeof api.api.questions.$post>['json']

type CreatedQuestion = InferResponseType<typeof api.api.questions.$post, 201>

type UpdateQuestionBody = InferRequestType<
  (typeof api.api.questions)[':id']['$put']
>['json']

type UpdatedQuestion = InferResponseType<
  (typeof api.api.questions)[':id']['$put'],
  200
>

type DemoUserCredentials = InferResponseType<(typeof api.api)['demo-user']['$get']>

type CreateDemoUserBody = InferRequestType<(typeof api.api)['demo-user']['$post']>['json']

export const clientApi = {
  async loadQuestions(): Promise<QuestionsResponse> {
    const response = await wrap(api.api.questions.$get())

    return await readJson<QuestionsResponse>(response, 'GET /api/questions failed')
  },

  async loadQuestion(id: string): Promise<QuestionResponse | null> {
    const response = await wrap(
      api.api.questions[':id'].$get({ param: { id } }),
    )

    if (response.status === 404) {
      return null
    }

    return await readJson<QuestionResponse>(
      response,
      'GET /api/questions/:id failed',
    )
  },

  async createQuestion(questionFields: CreateQuestionBody): Promise<CreatedQuestion> {
    const response = await wrap(
      api.api.questions.$post({
        json: questionFields,
      }),
    )

    return await readJson<CreatedQuestion>(response, 'POST /api/questions failed')
  },

  async updateQuestion(
    id: string,
    questionFields: UpdateQuestionBody,
  ): Promise<UpdatedQuestion> {
    const response = await wrap(
      api.api.questions[':id'].$put({
        param: { id },
        json: questionFields,
      }),
    )

    return await readJson<UpdatedQuestion>(
      response,
      'PUT /api/questions/:id failed',
    )
  },

  async deleteQuestion(id: string): Promise<void> {
    const response = await wrap(
      api.api.questions[':id'].$delete({
        param: { id },
      }),
    )

    if (!response.ok) {
      throw new Error(`DELETE /api/questions/:id failed: ${response.status}`)
    }
  },

  async loadDemoUser(): Promise<DemoUserCredentials> {
    const response = await wrap(api.api['demo-user'].$get())

    return await readJson<DemoUserCredentials>(
      response,
      'GET /api/demo-user failed',
    )
  },

  async createDemoUser(demoSignIn: CreateDemoUserBody): Promise<void> {
    const response = await wrap(
      api.api['demo-user'].$post({
        json: demoSignIn,
      }),
    )

    if (!response.ok) {
      throw new Error(`POST /api/demo-user failed: ${response.status}`)
    }
  },

  async deleteUser(): Promise<void> {
    const response = await wrap(api.api['demo-user'].$delete())

    if (!response.ok) {
      throw new Error(`DELETE /api/demo-user failed: ${response.status}`)
    }
  },
}
