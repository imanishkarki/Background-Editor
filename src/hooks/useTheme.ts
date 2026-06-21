import { useState, useCallback, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'pixelated' | 'gradient' | 'texture'

const STORAGE_KEY = 'color-bg-remover-theme'

const THEME_CLASSES: Record<Theme, string[]> = {
  light: [],
  dark: ['dark'],
  pixelated: ['dark', 'theme-pixelated'],
  gradient: ['dark', 'theme-gradient'],
  texture: ['theme-texture'],
}

const ALL_THEME_CLASSES = ['dark', 'theme-pixelated', 'theme-gradient', 'theme-texture']

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'pixelated' || stored === 'gradient' || stored === 'texture') return stored
  } catch {}
  return 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove(...ALL_THEME_CLASSES)
    root.classList.add(...THEME_CLASSES[theme])
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {}
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
  }, [])

  return { theme, setTheme }
}
