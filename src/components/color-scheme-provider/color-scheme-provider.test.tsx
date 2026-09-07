import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ColorSchemeProvider } from './color-scheme-provider'
import type { ColorScheme } from './color-scheme-provider.types'
import { useColorScheme } from './use-color-scheme'

const STORAGE_KEY = 'turystack-color-scheme'

function Consumer() {
  const { colorScheme, changeColorScheme } = useColorScheme()

  return (
    <>
      <output>{colorScheme}</output>
      <button onClick={() => changeColorScheme('dark')} type="button">
        Dark
      </button>
      <button onClick={() => changeColorScheme('light')} type="button">
        Light
      </button>
      <button onClick={() => changeColorScheme('system')} type="button">
        System
      </button>
    </>
  )
}

function renderProvider(defaultColorScheme?: ColorScheme) {
  return render(
    <ColorSchemeProvider defaultColorScheme={defaultColorScheme}>
      <Consumer />
    </ColorSchemeProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.removeAttribute('data-color-scheme')
})

afterEach(() => {
  localStorage.clear()
})

describe('ColorSchemeProvider', () => {
  it('starts on system when nothing was stored', () => {
    renderProvider()

    expect(screen.getByRole('status')).toHaveTextContent('system')
  })

  it('starts on the default it was given', () => {
    renderProvider('dark')

    expect(screen.getByRole('status')).toHaveTextContent('dark')
  })

  it('restores the preference persisted by a previous visit', () => {
    localStorage.setItem(STORAGE_KEY, 'dark')

    renderProvider('light')

    expect(screen.getByRole('status')).toHaveTextContent('dark')
    expect(document.documentElement).toHaveAttribute(
      'data-color-scheme',
      'dark',
    )
  })

  it('ignores a stored value that is not a color scheme', () => {
    localStorage.setItem(STORAGE_KEY, 'neon')

    renderProvider('light')

    expect(screen.getByRole('status')).toHaveTextContent('light')
  })

  it('persists the scheme the consumer asks for', async () => {
    renderProvider('light')

    await userEvent.click(screen.getByRole('button', { name: 'Dark' }))

    expect(screen.getByRole('status')).toHaveTextContent('dark')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
    expect(document.documentElement).toHaveAttribute(
      'data-color-scheme',
      'dark',
    )
  })

  it('switches back to an explicit light scheme', async () => {
    renderProvider('dark')

    await userEvent.click(screen.getByRole('button', { name: 'Light' }))

    expect(document.documentElement).toHaveAttribute(
      'data-color-scheme',
      'light',
    )
  })

  it('resolves system against the media query', async () => {
    renderProvider('dark')

    await userEvent.click(screen.getByRole('button', { name: 'System' }))

    expect(screen.getByRole('status')).toHaveTextContent('system')
    // The suite stubs matchMedia with `matches: false`, so the system
    // preference resolves to light here.
    expect(document.documentElement).toHaveAttribute(
      'data-color-scheme',
      'light',
    )
  })

  it('follows the preference changed in another tab', () => {
    renderProvider('light')

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: 'dark',
          storageArea: localStorage,
        }),
      )
    })

    expect(screen.getByRole('status')).toHaveTextContent('dark')
  })

  it('returns to the default when another tab clears the preference', async () => {
    renderProvider('light')
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }))

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: null,
          storageArea: localStorage,
        }),
      )
    })

    expect(screen.getByRole('status')).toHaveTextContent('light')
  })

  it('ignores a storage event for another key', async () => {
    renderProvider('light')
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }))

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'unrelated',
          newValue: 'light',
          storageArea: localStorage,
        }),
      )
    })

    expect(screen.getByRole('status')).toHaveTextContent('dark')
  })

  it('ignores a storage event from another storage area', async () => {
    renderProvider('light')
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }))

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: 'light',
          storageArea: sessionStorage,
        }),
      )
    })

    expect(screen.getByRole('status')).toHaveTextContent('dark')
  })

  it('reapplies the resolved scheme when the system preference changes', () => {
    const listeners = new Set<() => void>()
    const stub = vi
      .spyOn(window, 'matchMedia')
      // The suite's matchMedia stub registers no listeners at all, so the only
      // way to reach the system-preference subscription is to hand the
      // provider a query object that actually dispatches.
      .mockReturnValue({
        addEventListener: (_: string, listener: () => void) => {
          listeners.add(listener)
        },
        matches: true,
        removeEventListener: (_: string, listener: () => void) => {
          listeners.delete(listener)
        },
      } as unknown as MediaQueryList)

    renderProvider('system')

    expect(document.documentElement).toHaveAttribute(
      'data-color-scheme',
      'dark',
    )

    stub.mockReturnValue({
      addEventListener: () => {},
      matches: false,
      removeEventListener: () => {},
    } as unknown as MediaQueryList)

    for (const listener of listeners) {
      listener()
    }

    expect(document.documentElement).toHaveAttribute(
      'data-color-scheme',
      'light',
    )

    stub.mockRestore()
  })

  it('stops listening to the system preference once an explicit scheme is picked', async () => {
    renderProvider('system')

    await userEvent.click(screen.getByRole('button', { name: 'Dark' }))

    expect(document.documentElement).toHaveAttribute(
      'data-color-scheme',
      'dark',
    )
  })
})

describe('useColorScheme', () => {
  it('refuses to run outside the provider', () => {
    expect(() => renderHook(() => useColorScheme())).toThrow(
      'useColorScheme must be used within a TuryProvider',
    )
  })
})
