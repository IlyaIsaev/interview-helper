import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Cookie } from 'lucide-react'

import { Button } from '@/shared/ui'

import { cookieConsent } from '../model/cookie-consent'

export const CookieConsent = reatomComponent(() => {
  if (!cookieConsent.shouldShowBanner()) {
    return null
  }

  const handleAccept = wrap(cookieConsent.accept)
  const handleDecline = wrap(cookieConsent.decline)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] w-full p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:p-0">
      <div className="rounded-none border border-border bg-background shadow-lg dark:bg-card">
        <div className="grid gap-2">
          <div className="flex h-12 items-center justify-between border-b border-border p-3 sm:h-14 sm:p-4">
            <h1 className="text-xs font-normal uppercase tracking-[1.5px] text-muted-foreground">
              We use cookies
            </h1>
            <Cookie className="size-4" />
          </div>
          <div className="p-3 sm:p-4">
            <p className="text-start text-xs font-normal text-muted-foreground sm:text-sm">
              We use cookies to ensure you get the best experience on our
              website.
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-2 border-t border-border p-3 sm:py-5 dark:bg-background/20">
            <Button type="button" className="w-full" onClick={handleAccept}>
              Accept
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDecline}
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}, 'CookieConsent')
