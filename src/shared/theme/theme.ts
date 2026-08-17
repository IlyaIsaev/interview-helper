import { atom, effect, withLocalStorage } from '@reatom/core'

export const theme = atom<'light' | 'dark'>('dark', 'theme').extend(
  withLocalStorage('theme'),
)

effect(() => {
  const mode = theme()

  document.documentElement.classList.toggle('dark', mode === 'dark')
}, 'theme.syncDocument')
