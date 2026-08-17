import { action } from '@reatom/core'

import { theme } from '@/shared/theme'

export const toggleTheme = action(() => {
  theme.set((mode) => (mode === 'dark' ? 'light' : 'dark'))
}, 'toggleTheme')
