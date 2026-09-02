import type { CSSProperties } from 'react'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster({ theme, ...props }: ToasterProps) {
  return (
    <Sonner
      theme={theme}
      className="toaster group font-mono"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        className: 'rounded-none font-mono text-ui',
        classNames: {
          description: 'line-clamp-4 whitespace-pre-wrap break-words',
        },
      }}
      style={
        {
          '--normal-bg': 'hsl(var(--popover))',
          '--normal-text': 'hsl(var(--popover-foreground))',
          '--normal-border': 'hsl(var(--border))',
          '--error-bg': 'hsl(var(--destructive))',
          '--error-text': 'hsl(var(--destructive-foreground))',
          '--error-border': 'hsl(var(--destructive))',
          '--border-radius': 'var(--radius)',
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
