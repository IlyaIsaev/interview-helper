import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib'

type CardProps = ComponentProps<'div'>
type CardHeaderProps = ComponentProps<'div'>
type CardTitleProps = ComponentProps<'div'>
type CardDescriptionProps = ComponentProps<'div'>
type CardActionProps = ComponentProps<'div'>
type CardContentProps = ComponentProps<'div'>
type CardFooterProps = ComponentProps<'div'>

function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'card-glow flex flex-col gap-3 rounded-none border bg-card py-0 text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-3.5 py-2.5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-3',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'text-xs font-normal uppercase tracking-[1.5px] text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
        className={cn('px-3.5 pb-3.5', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
        className={cn('flex items-center px-3.5 pb-3.5 [.border-t]:pt-3', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
}

export type {
  CardActionProps,
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
}
