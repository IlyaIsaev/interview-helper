import { Root as LabelPrimitive } from '@radix-ui/react-label'
import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib'

type LabelProps = ComponentProps<typeof LabelPrimitive>

function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive
      className={cn(
        'text-label font-medium uppercase tracking-[1.5px] text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  )
}

export { Label }

export type { LabelProps }
