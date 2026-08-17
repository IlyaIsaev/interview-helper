export const homePath = '/'

export const signInPath = '/sign-in'

export const signUpPath = '/sign-up'

export const profilePath = '/profile'

export const questionsPath = '/questions'

export const questionPath = (questionId: string) =>
  `${questionsPath}/${questionId}`
