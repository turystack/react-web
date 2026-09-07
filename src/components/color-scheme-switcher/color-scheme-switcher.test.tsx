import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ColorSchemeProvider } from '@/components/color-scheme-provider'

import { ColorSchemeSwitcher } from './color-scheme-switcher'

// The provider persists the scheme in localStorage, which jsdom keeps alive
// across tests in the same file, so a leftover choice would decide the next
// test's initial selection.
beforeEach(() => {
  localStorage.clear()
})

function renderSwitcher(
  ui: React.ReactNode,
  defaultColorScheme?: 'light' | 'dark' | 'system',
) {
  return render(
    <ColorSchemeProvider defaultColorScheme={defaultColorScheme}>
      {ui}
    </ColorSchemeProvider>,
  )
}

function checked() {
  return screen
    .getAllByRole('radio')
    .filter((option) => option.getAttribute('aria-checked') === 'true')
    .map((option) => option.getAttribute('aria-label'))
}

describe('ColorSchemeSwitcher', () => {
  it('offers one radio per scheme inside a named radiogroup', () => {
    renderSwitcher(<ColorSchemeSwitcher />)

    expect(
      screen.getByRole('radiogroup', { name: 'Color scheme' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'System' })).toBeInTheDocument()
  })

  it('starts on the scheme the provider was given', () => {
    renderSwitcher(<ColorSchemeSwitcher />, 'light')

    expect(checked()).toEqual(['Light'])
  })

  it('falls back to system when the provider names no scheme', () => {
    renderSwitcher(<ColorSchemeSwitcher />)

    expect(checked()).toEqual(['System'])
  })

  it('moves the selection to the clicked scheme, one at a time', async () => {
    renderSwitcher(<ColorSchemeSwitcher />)

    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }))
    expect(checked()).toEqual(['Dark'])

    await userEvent.click(screen.getByRole('radio', { name: 'Light' }))
    expect(checked()).toEqual(['Light'])

    await userEvent.click(screen.getByRole('radio', { name: 'System' }))
    expect(checked()).toEqual(['System'])
  })

  it('writes the scheme through the provider, not into its own state', async () => {
    renderSwitcher(
      <>
        <ColorSchemeSwitcher />
        <ColorSchemeSwitcher />
      </>,
    )

    const [firstDark] = screen.getAllByRole('radio', { name: 'Dark' })
    await userEvent.click(firstDark)

    expect(
      screen
        .getAllByRole('radio', { name: 'Dark' })
        .map((option) => option.getAttribute('aria-checked')),
    ).toEqual(['true', 'true'])
  })
})

describe.each(['sm', 'md', 'lg'] as const)(
  'ColorSchemeSwitcher size %s',
  (size) => {
    it('keeps every scheme selectable', async () => {
      renderSwitcher(<ColorSchemeSwitcher size={size} />)

      await userEvent.click(screen.getByRole('radio', { name: 'Dark' }))

      expect(checked()).toEqual(['Dark'])
    })
  },
)
