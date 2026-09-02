import { action, atom, computed, withCookie } from '@reatom/core'

const COOKIE_CONSENT_KEY = 'cookieConsent'

const COOKIE_PATH = '/'

const COOKIE_CONSENT_EXPIRES_AT = new Date('9999-12-31T23:59:59.000Z')

export const cookieConsent = atom(false, 'cookieConsent').extend(
  withCookie({
    key: COOKIE_CONSENT_KEY,
    path: COOKIE_PATH,
    expires: COOKIE_CONSENT_EXPIRES_AT,
    // document.cookie cannot subscribe; CookieAttributes types this as `never`.
    // @ts-expect-error persist subscribe is a separate option from cookie attrs
    subscribe: false,
    toSnapshot: (isAccepted: boolean) => (isAccepted ? 'true' : ''),
    fromSnapshot: (snapshot: string) =>
      snapshot === 'true' || snapshot === '"true"',
  }),
  (target) => ({
    shouldShowBanner: computed(
      () => !target(),
      `${target.name}.shouldShowBanner`,
    ),
    accept: action(() => {
      target.set(true)
    }, `${target.name}.accept`),
    decline: action(() => {
      window.location.assign('https://www.google.com')
    }, `${target.name}.decline`),
  }),
)
