import { abortVar, wrap } from "@reatom/core";
import { toMerged } from "es-toolkit";
import { hc } from "hono/client";
import type { InferRequestType, InferResponseType } from "hono/client";

import { session } from "@/shared/auth";

import type { AppType } from "../../../worker";

const api = hc<AppType>("/", {
  init: {
    credentials: "include",
  },
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    const { controller, unsubscribe } = abortVar.subscribe();

    return wrap(
      fetch(
        input,
        toMerged(init ?? {}, {
          signal: init?.signal ?? controller.signal,
        }),
      ),
    ).finally(() => {
      unsubscribe();
    });
  },
});

const retrySessionIfUnauthorized = async (response: Response): Promise<void> => {
  if (response.status !== 401) return;

  await wrap(session.retry());
};

const isErrorMessageBody = (body: unknown): body is { message: string } =>
  typeof body === "object" &&
  body !== null &&
  "message" in body &&
  typeof body.message === "string";

const failedRequestMessage = async (response: Response, failedMessage: string): Promise<string> => {
  try {
    const body: unknown = await wrap(response.json());

    if (isErrorMessageBody(body)) return body.message;
  } catch {
    return `${failedMessage}: ${response.status}`;
  }

  return `${failedMessage}: ${response.status}`;
};

const readJson = async <TBody>(response: Response, failedMessage: string): Promise<TBody> => {
  await retrySessionIfUnauthorized(response);

  if (!response.ok) throw new Error(`${failedMessage}: ${response.status}`);

  const body: unknown = await wrap(response.json());

  // Response.json() is untyped; callers pass the Hono 200 body type.
  return body as TBody;
};

type QuestionsResponse = InferResponseType<typeof api.api.questions.$get, 200>;

type QuestionResponse = InferResponseType<(typeof api.api.questions)[":id"]["$get"], 200>;

type CreateQuestionBody = InferRequestType<typeof api.api.questions.$post>["json"];

type CreatedQuestion = InferResponseType<typeof api.api.questions.$post, 201>;

type UpdateQuestionBody = InferRequestType<(typeof api.api.questions)[":id"]["$put"]>["json"];

type UpdatedQuestion = InferResponseType<(typeof api.api.questions)[":id"]["$put"], 200>;

type ChangePasswordBody = InferRequestType<typeof api.api.user.password.$post>["json"];

export const clientApi = {
  async loadQuestions(query = ""): Promise<QuestionsResponse> {
    const response = await wrap(
      api.api.questions.$get({
        query: query.length === 0 ? {} : { q: query },
      }),
    );

    return await readJson<QuestionsResponse>(response, "GET /api/questions failed");
  },

  async loadQuestion(id: string): Promise<QuestionResponse | null> {
    const response = await wrap(api.api.questions[":id"].$get({ param: { id } }));

    if (response.status === 404) return null;

    return await readJson<QuestionResponse>(response, "GET /api/questions/:id failed");
  },

  async createQuestion(questionFields: CreateQuestionBody): Promise<CreatedQuestion> {
    const response = await wrap(
      api.api.questions.$post({
        json: questionFields,
      }),
    );

    await retrySessionIfUnauthorized(response);

    if (!response.ok)
      throw new Error(await failedRequestMessage(response, "POST /api/questions failed"));

    const createdQuestion: unknown = await wrap(response.json());

    // Response.json() is untyped; CreatedQuestion is the Hono 201 body type.
    return createdQuestion as CreatedQuestion;
  },

  async updateQuestion(id: string, questionFields: UpdateQuestionBody): Promise<UpdatedQuestion> {
    const response = await wrap(
      api.api.questions[":id"].$put({
        param: { id },
        json: questionFields,
      }),
    );

    return await readJson<UpdatedQuestion>(response, "PUT /api/questions/:id failed");
  },

  async deleteQuestion(id: string): Promise<void> {
    const response = await wrap(
      api.api.questions[":id"].$delete({
        param: { id },
      }),
    );

    await retrySessionIfUnauthorized(response);

    if (!response.ok) throw new Error(`DELETE /api/questions/:id failed: ${response.status}`);
  },

  async publishQuestions(): Promise<void> {
    const response = await wrap(api.api.questions.publish.$post());

    await retrySessionIfUnauthorized(response);

    if (!response.ok) throw new Error(`POST /api/questions/publish failed: ${response.status}`);
  },

  async deleteUser(): Promise<void> {
    const response = await wrap(api.api.user.$delete());

    if (!response.ok) throw new Error(`DELETE /api/user failed: ${response.status}`);
  },

  async changePassword(passwordChange: ChangePasswordBody): Promise<void> {
    const response = await wrap(
      api.api.user.password.$post({
        json: passwordChange,
      }),
    );

    await retrySessionIfUnauthorized(response);

    if (!response.ok) throw new Error(`POST /api/user/password failed: ${response.status}`);
  },
};
