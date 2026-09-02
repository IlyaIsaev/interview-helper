import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'
import { Moon, Sun } from 'lucide-react'

import { theme, ThemeMode } from '@/shared/theme'
import { Button } from '@/shared/ui'

import { toggleTheme } from '../model/theme-switcher'

export const ThemeSwitcher = reatomComponent(() => {
  const themeMode = theme()
  const isDark = themeMode === ThemeMode.dark
  const handleToggleTheme = wrap(toggleTheme)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={handleToggleTheme}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}, 'ThemeSwitcher')
