import { wrap, type FieldAtom } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Slot } from '@radix-ui/react-slot'
import { createContext, use, useId, type ComponentProps, type ReactNode } from 'react'

import { cn } from '@/shared/lib'

import { Label } from './label'

type FormFieldContextValue = {
  field: FieldAtom
}

type FormItemContextValue = {
  id: string
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null)

const FormItemContext = createContext<FormItemContextValue | null>(null)

type FormProps = Omit<ComponentProps<'form'>, 'onSubmit'> & {
  onSubmit: () => void
}

function Form({ className, onSubmit, ...props }: FormProps) {
  return (
    <form
      className={cn('flex flex-col gap-4', className)}
      onSubmit={wrap((event) => {
        event.preventDefault()
        onSubmit()
      })}
      {...props}
    />
  )
}

type FormFieldProps = {
  field: FieldAtom
  children: ReactNode
}

const FormField = reatomComponent(({ field, children }: FormFieldProps) => {
  return (
    <FormFieldContext.Provider value={{ field }}>
      {children}
    </FormFieldContext.Provider>
  )
}, 'FormField')

const useFormField = () => {
  const fieldContext = use(FormFieldContext)
  const itemContext = use(FormItemContext)

  if (!fieldContext) {
    throw new Error('useFormField must be used within FormField')
  }

  if (!itemContext) {
    throw new Error('useFormField must be used within FormItem')
  }

  const { error, triggered } = fieldContext.field.validation()
  const { id } = itemContext

  return {
    id,
    error: triggered ? error : undefined,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  }
}

type FormItemProps = ComponentProps<'div'>

function FormItem({ className, ...props }: FormItemProps) {
  const id = useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('flex flex-col gap-2', className)} {...props} />
    </FormItemContext.Provider>
  )
}

type FormLabelProps = ComponentProps<typeof Label>

const FormLabel = reatomComponent(({ className, ...props }: FormLabelProps) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}, 'FormLabel')

type FormControlProps = ComponentProps<typeof Slot>

const FormControl = reatomComponent((props: FormControlProps) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      id={formItemId}
      aria-describedby={
        error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId
      }
      aria-invalid={Boolean(error)}
      {...props}
    />
  )
}, 'FormControl')

type FormDescriptionProps = ComponentProps<'p'>

const FormDescription = reatomComponent(
  ({ className, ...props }: FormDescriptionProps) => {
    const { formDescriptionId } = useFormField()

    return (
      <p
        id={formDescriptionId}
        className={cn('text-ui text-muted-foreground', className)}
        {...props}
      />
    )
  },
  'FormDescription',
)

type FormMessageProps = ComponentProps<'p'>

const FormMessage = reatomComponent(
  ({ className, children, ...props }: FormMessageProps) => {
    const fieldContext = use(FormFieldContext)
    const itemContext = use(FormItemContext)
    const fieldValidation = fieldContext?.field.validation()
    const fieldError =
      fieldValidation?.triggered === true ? fieldValidation.error : undefined
    const body = fieldError ?? children

    if (!body) {
      return null
    }

    return (
      <p
        id={itemContext ? `${itemContext.id}-form-item-message` : undefined}
        className={cn('text-ui font-medium text-destructive', className)}
        {...props}
      >
        {body}
      </p>
    )
  },
  'FormMessage',
)

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
}

export type {
  FormControlProps,
  FormDescriptionProps,
  FormFieldProps,
  FormItemProps,
  FormLabelProps,
  FormMessageProps,
  FormProps,
}
