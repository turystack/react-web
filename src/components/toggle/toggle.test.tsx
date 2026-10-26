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

describe('Toggle axes', () => {
  it('publishes its default size and variant for a theme to select', () => {
    render(<Toggle ariaLabel="Bold">B</Toggle>)

    const toggle = screen.getByRole('button', { name: 'Bold' })
    expect(toggle).toHaveAttribute('data-size', 'md')
    expect(toggle).toHaveAttribute('data-variant', 'default')
  })

  it('publishes the size and variant it was given', () => {
    render(
      <Toggle ariaLabel="Bold" size="lg" variant="outline">
        B
      </Toggle>,
    )

    const toggle = screen.getByRole('button', { name: 'Bold' })
    expect(toggle).toHaveAttribute('data-size', 'lg')
    expect(toggle).toHaveAttribute('data-variant', 'outline')
  })

  it('publishes what a group hands down, on the group and on each toggle', () => {
    render(
      <Toggle.Group ariaLabel="Marks" size="sm" variant="outline">
        <Toggle ariaLabel="Bold" value="bold">
          B
        </Toggle>
      </Toggle.Group>,
    )

    const group = screen.getByTestId('toggle-group')
    expect(group).toHaveAttribute('data-size', 'sm')
    expect(group).toHaveAttribute('data-variant', 'outline')
    const toggle = screen.getByRole('button', { name: 'Bold' })
    expect(toggle).toHaveAttribute('data-size', 'sm')
    expect(toggle).toHaveAttribute('data-variant', 'outline')
  })

  it('publishes the toggle defaults on a bare group and its toggles', () => {
    render(
      <Toggle.Group ariaLabel="Marks">
        <Toggle ariaLabel="Bold" value="bold">
          B
        </Toggle>
      </Toggle.Group>,
    )

    const group = screen.getByTestId('toggle-group')
    expect(group).toHaveAttribute('data-size', 'md')
    expect(group).toHaveAttribute('data-variant', 'default')
    const toggle = screen.getByRole('button', { name: 'Bold' })
    expect(toggle).toHaveAttribute('data-size', 'md')
    expect(toggle).toHaveAttribute('data-variant', 'default')
  })

  it('lets a toggle override what its group hands down', () => {
    render(
      <Toggle.Group ariaLabel="Marks" size="sm">
        <Toggle ariaLabel="Bold" size="lg" value="bold">
          B
        </Toggle>
      </Toggle.Group>,
    )

    expect(screen.getByTestId('toggle-group')).toHaveAttribute(
      'data-size',
      'sm',
    )
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'data-size',
      'lg',
    )
  })
})

describe('Toggle disabledReason', () => {
  const reason = 'Bold is off in titles'

  it('renders no wrapper and no description without a reason', () => {
    render(<Toggle ariaLabel="Bold">B</Toggle>)

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby')
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('is blocked but stays in the tab order, and presses change nothing', async () => {
    const onChange = vi.fn()

    render(
      <>
        <button type="button">before</button>
        <Toggle ariaLabel="Bold" disabledReason={reason} onChange={onChange}>
          B
        </Toggle>
      </>,
    )
    const toggle = screen.getByRole('button', { name: 'Bold' })

    expect(toggle).toHaveAttribute('aria-disabled', 'true')
    expect(toggle).not.toHaveAttribute('disabled')

    await userEvent.tab()
    await userEvent.tab()
    expect(toggle).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(toggle, { pointerEventsCheck: 0 })

    expect(onChange).not.toHaveBeenCalled()
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('is described by the reason and shows it on keyboard focus', async () => {
    render(
      <Toggle ariaLabel="Bold" disabledReason={reason}>
        B
      </Toggle>,
    )

    expect(screen.getByRole('button')).toHaveAccessibleDescription(reason)

    await userEvent.tab()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)
  })

  it('in a group, arrow keys still reach it and it never joins the value', async () => {
    const onChange = vi.fn()

    render(
      <Toggle.Group ariaLabel="Marks" onChange={onChange}>
        <Toggle ariaLabel="Bold" value="bold">
          B
        </Toggle>
        <Toggle ariaLabel="Italic" disabledReason={reason} value="italic">
          I
        </Toggle>
      </Toggle.Group>,
    )
    const italic = screen.getByRole('button', { name: 'Italic' })

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(italic).toHaveFocus()
    expect(italic).toHaveAttribute('aria-disabled', 'true')
    expect(italic).toHaveAccessibleDescription(reason)

    await userEvent.keyboard(' ')
    await userEvent.click(italic, { pointerEventsCheck: 0 })

    expect(onChange).not.toHaveBeenCalled()
    expect(italic).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('Toggle disabledReason, edge cases', () => {
  const reason = 'Bold is off in titles'

  function Marks({ blocked }: { blocked: boolean }) {
    return (
      <Toggle.Group ariaLabel="Marks">
        <Toggle ariaLabel="Bold" value="bold">
          B
        </Toggle>
        <Toggle
          ariaLabel="Italic"
          disabledReason={blocked ? reason : undefined}
          value="italic"
        >
          I
        </Toggle>
      </Toggle.Group>
    )
  }

  it('keeps focus when a reason arrives on the focused toggle in a group', async () => {
    const { rerender } = render(<Marks blocked={false} />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    const italic = () => screen.getByRole('button', { name: 'Italic' })
    expect(italic()).toHaveFocus()

    rerender(<Marks blocked />)

    expect(italic()).toHaveFocus()
    expect(italic()).toHaveAttribute('aria-disabled', 'true')
    expect(italic()).toHaveAccessibleDescription(reason)

    rerender(<Marks blocked={false} />)

    expect(italic()).toHaveFocus()
  })
})

describe('Toggle disabledReason, kept value', () => {
  it('stays pressed when a reason arrives', async () => {
    const { rerender } = render(<Toggle ariaLabel="Bold">B</Toggle>)

    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')

    rerender(
      <Toggle ariaLabel="Bold" disabledReason="Read-only document">
        B
      </Toggle>,
    )

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })
})
