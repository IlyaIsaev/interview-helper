import { atom, effect, withLocalStorage } from '@reatom/core'
import type { ValueOf } from 'es-toolkit/types'

const THEME_STORAGE_KEY = 'theme'

export const ThemeMode = {
  light: 'light',
  dark: 'dark',
} as const

export type ThemeMode = ValueOf<typeof ThemeMode>

export const theme = atom<ThemeMode>(ThemeMode.light, 'theme').extend(
  withLocalStorage(THEME_STORAGE_KEY),
)

effect(() => {
  const themeMode = theme()

  document.documentElement.classList.toggle('dark', themeMode === ThemeMode.dark)
}, 'theme.syncDocument')
