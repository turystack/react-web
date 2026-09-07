import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { useColorScheme } from '@/components/color-scheme-provider'
import { toast } from '@/components/toast'

import { TuryProvider } from './tury-provider'

function SchemeProbe() {
  const { changeColorScheme, colorScheme } = useColorScheme()

  return (
    <div>
      <output>{colorScheme}</output>
      <button onClick={() => changeColorScheme('dark')} type="button">
        Use dark
      </button>
    </div>
  )
}

beforeEach(() => {
  // The provider seeds its state from localStorage, so a scheme persisted by an
  // earlier test would silently win over the defaultColorScheme under test.
  localStorage.clear()
})

describe('TuryProvider', () => {
  it('renders the application it wraps', () => {
    render(
      <TuryProvider>
        <h1>Dashboard</h1>
      </TuryProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })

  it('starts on the system color scheme when none is asked for', () => {
    render(
      <TuryProvider>
        <SchemeProbe />
      </TuryProvider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('system')
  })

  it('hands the requested default color scheme to its consumers', () => {
    render(
      <TuryProvider defaultColorScheme="light">
        <SchemeProbe />
      </TuryProvider>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('light')
  })

  it('delivers the new color scheme a consumer selects', async () => {
    render(
      <TuryProvider defaultColorScheme="light">
        <SchemeProbe />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Use dark' }))

    expect(screen.getByRole('status')).toHaveTextContent('dark')
    expect(localStorage.getItem('turystack-color-scheme')).toBe('dark')
  })

  it('mounts the toaster so a child can raise a toast', async () => {
    render(
      <TuryProvider>
        <button onClick={() => toast('Order saved')} type="button">
          Save
        </button>
      </TuryProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Order saved')).toBeInTheDocument()
  })
})
