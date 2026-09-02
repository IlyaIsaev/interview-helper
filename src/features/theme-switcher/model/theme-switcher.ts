import { action } from '@reatom/core'

import { theme, ThemeMode } from '@/shared/theme'

export const toggleTheme = action(() => {
  theme.set((themeMode) =>
    themeMode === ThemeMode.dark ? ThemeMode.light : ThemeMode.dark,
  )
}, 'toggleTheme')
