import { useCallback, useEffect, useMemo, useState } from 'react'

import { ColorSchemeContext } from './color-scheme-provider.context'
import type {
  ColorScheme,
  ColorSchemeProviderProps,
  ResolvedColorScheme,
} from './color-scheme-provider.types'

const STORAGE_KEY = 'turystack-color-scheme'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

function getSystemScheme(): ResolvedColorScheme {
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
}

function isColorScheme(value: string | null): value is ColorScheme {
  return value === 'system' || value === 'dark' || value === 'light'
}

function disableTransitionsTemporarily() {
  const style = document.createElement('style')
  style.appendChild(
    document.createTextNode(
      '*,*::before,*::after{-webkit-transition:none!important;transition:none!important}',
    ),
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

function applyColorScheme(scheme: ColorScheme) {
  const root = document.documentElement
  const resolved = scheme === 'system' ? getSystemScheme() : scheme
  const restoreTransitions = disableTransitionsTemporarily()

  root.classList.remove('light', 'dark')
  root.classList.add(resolved)

  restoreTransitions()
}

export function ColorSchemeProvider({
  children,
  defaultColorScheme = 'system',
}: ColorSchemeProviderProps) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isColorScheme(stored)) {
      return stored
    }
    return defaultColorScheme
  })

  const changeColorScheme = useCallback((next: ColorScheme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setColorScheme(next)
  }, [])

  useEffect(() => {
    applyColorScheme(colorScheme)

    if (colorScheme !== 'system') {
      return undefined
    }

    const mediaQuery = window.matchMedia(MEDIA_QUERY)
    const handleChange = () => applyColorScheme('system')

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [colorScheme])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || event.key !== STORAGE_KEY) {
        return
      }
      if (isColorScheme(event.newValue)) {
        setColorScheme(event.newValue)
      } else {
        setColorScheme(defaultColorScheme)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [defaultColorScheme])

  const value = useMemo(
    () => ({
      changeColorScheme,
      colorScheme,
    }),
    [colorScheme, changeColorScheme],
  )

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  )
}
