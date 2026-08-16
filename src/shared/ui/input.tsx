import type { InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib'

type InputProps = InputHTMLAttributes<HTMLInputElement>

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-none border border-input bg-background px-3 py-1 text-ui text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-ui file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }

export type { InputProps }
