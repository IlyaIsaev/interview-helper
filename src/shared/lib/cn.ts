import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const mergeClassNames = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-label',
        'text-ui',
        'text-heading',
        'text-stat',
        'text-hero',
      ],
    },
  },
})

export const cn = (...classNames: ClassValue[]) => {
  return mergeClassNames(clsx(classNames))
}
