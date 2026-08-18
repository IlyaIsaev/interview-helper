import { reatomComponent } from '@reatom/react'

import { signInPath } from '@/shared/config'
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
} from '@/shared/ui'

import { signUpForm } from '../model/sign-up'

const SignUpPage = reatomComponent(() => {
  const { fields, submit, validation } = signUpForm
  const isSubmitReady = submit.ready()
  const hasValidationErrors = validation().errors.length > 0
  const submitError = submit.error()
  const nameField = bindFormControl(fields.name)
  const emailField = bindFormControl(fields.email)
  const passwordField = bindFormControl(fields.password)


  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <p className="mb-1.5 text-xs uppercase tracking-[2px] text-muted-foreground">
          account
        </p>
        <h1 className="text-heading font-medium tracking-tight">Sign up</h1>
      </div>
      <Form
        className="border border-border bg-card p-4"
        onSubmit={submit}
      >
        <FormField field={fields.name}>
          <FormItem>
            <FormLabel>name</FormLabel>
            <FormControl>
              <Input type="text" autoComplete="name" {...nameField} />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
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
                autoComplete="new-password"
                {...passwordField}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormMessage>{submitError?.message}</FormMessage>
        <Button type="submit" disabled={!isSubmitReady || hasValidationErrors}>
          Create account
        </Button>
      </Form>
      <p className="text-ui text-muted-foreground">
        Already have an account?{' '}
        <a className="text-primary underline-offset-4 hover:underline" href={signInPath}>
          Sign in
        </a>
      </p>
    </section>
  )
}, 'SignUpPage')

export default SignUpPage
