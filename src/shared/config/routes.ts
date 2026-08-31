export const HOME_PATH = "/";

export const SIGN_IN_PATH = "/sign-in";

export const SIGN_UP_PATH = "/sign-up";

export const PROFILE_PATH = "/profile";

export const QUESTIONS_PATH = "/questions";

export const questionPath = (questionId: string): string => `${QUESTIONS_PATH}/${questionId}`;
