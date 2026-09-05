import { reatomComponent } from '@reatom/react'

import { CookieConsent } from './cookie-consent'
import {
  bindFormControl,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PageFallback,
} from '@/shared/ui'

import { signIn, signInForm } from '../model/sign-in'

const SignInPage = reatomComponent(() => {
  const signInScreen = signIn()
  const { fields, submit, validation } = signInForm
  const isSubmitReady = submit.ready()
  const hasValidationErrors = validation().errors.length > 0
  const submitError = submit.error()
  const emailField = bindFormControl(fields.email)
  const passwordField = bindFormControl(fields.password)

  if (signInScreen.kind === 'loading') {
    return (
      <>
        <PageFallback />
        <CookieConsent />
      </>
    )
  }

  return (
    <>
      <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
        <div>
          <p className="mb-1.5 text-xs uppercase tracking-[2px] text-muted-foreground">
            account
          </p>
          <h1 className="text-heading font-medium tracking-tight">Sign in</h1>
        </div>
        <Form className="border border-border bg-card p-4" onSubmit={submit}>
          <FormField field={fields.email}>
            <FormItem>
              <FormLabel>email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...emailField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField field={fields.password}>
            <FormItem>
              <FormLabel>password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...passwordField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormMessage>{submitError?.message}</FormMessage>
          <Button type="submit" disabled={!isSubmitReady || hasValidationErrors}>
            Sign in
          </Button>
        </Form>
      </section>
      <CookieConsent />
    </>
  )
}, 'SignInPage')

export default SignInPage
