import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Toggle } from './toggle'

describe('Toggle', () => {
  it('reports pressed to assistive technology, not only to the eye', async () => {
    render(<Toggle ariaLabel="Bold">B</Toggle>)

    const toggle = screen.getByRole('button', { name: 'Bold' })

    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('follows the page that controls it', async () => {
    const onChange = vi.fn()

    render(
      <Toggle ariaLabel="Bold" onChange={onChange} pressed={false}>
        B
      </Toggle>,
    )

    await userEvent.click(screen.getByTestId('toggle'))

    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('toggle')).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('starts pressed when told to', () => {
    render(
      <Toggle ariaLabel="Bold" defaultPressed>
        B
      </Toggle>,
    )

    expect(screen.getByTestId('toggle')).toHaveAttribute('aria-pressed', 'true')
  })

  it('refuses interaction while disabled', async () => {
    const onChange = vi.fn()

    render(
      <Toggle ariaLabel="Bold" disabled onChange={onChange}>
        B
      </Toggle>,
    )

    await userEvent.click(screen.getByTestId('toggle'))

    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('Toggle.Group', () => {
  function Marks(props: Parameters<typeof Toggle.Group>[0]) {
    return (
      <Toggle.Group ariaLabel="Marks" {...props}>
        <Toggle ariaLabel="Bold" value="bold">
          B
        </Toggle>
        <Toggle ariaLabel="Italic" value="italic">
          I
        </Toggle>
      </Toggle.Group>
    )
  }

  it('lets several be pressed at once by default', async () => {
    const onChange = vi.fn()

    render(<Marks onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Bold' }))
    await userEvent.click(screen.getByRole('button', { name: 'Italic' }))

    expect(onChange).toHaveBeenLastCalledWith(['bold', 'italic'])
  })

  it('keeps one at a time in single mode', async () => {
    const onChange = vi.fn()

    render(<Marks mode="single" onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Bold' }))
    await userEvent.click(screen.getByRole('button', { name: 'Italic' }))

    expect(onChange).toHaveBeenLastCalledWith(['italic'])
  })

  it('hands its size and variant down to the toggles inside it', () => {
    render(<Marks size="sm" variant="outline" />)

    const [bold] = screen.getAllByTestId('toggle')

    expect(bold.className).toContain('h-9')
    expect(bold.className).toContain('border')
  })

  it('disables every toggle at once', async () => {
    const onChange = vi.fn()

    render(<Marks disabled onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Bold' }))

    expect(onChange).not.toHaveBeenCalled()
  })
})
