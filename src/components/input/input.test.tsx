import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Input } from './input'

afterEach(() => {
  vi.useRealTimers()
})

describe('Input', () => {
  it('delivers the typed text', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} placeholder="Search" />)

    await userEvent.type(screen.getByPlaceholderText('Search'), 'ab')

    expect(onChange).toHaveBeenLastCalledWith('ab')
  })

  it('delivers null once the field is emptied', async () => {
    const onChange = vi.fn()
    render(<Input defaultValue="ab" onChange={onChange} />)

    await userEvent.clear(screen.getByRole('textbox'))

    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('holds the controlled value against typing', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} value="fixed" />)

    const field = screen.getByRole('textbox')
    await userEvent.type(field, 'x')

    expect(field).toHaveValue('fixed')
    expect(onChange).toHaveBeenLastCalledWith('fixedx')
  })

  it('shows an empty field when the controlled value is null', () => {
    render(<Input onChange={vi.fn()} value={null} />)

    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('changes on its own from a defaultValue', async () => {
    render(<Input defaultValue="ab" />)

    const field = screen.getByRole('textbox')
    await userEvent.type(field, 'c')

    expect(field).toHaveValue('abc')
  })

  it('starts empty when the uncontrolled default is null', () => {
    render(<Input defaultValue={null} />)

    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('accepts typing when no onChange is listening', async () => {
    render(<Input />)

    const field = screen.getByRole('textbox')
    await userEvent.type(field, 'ab')

    expect(field).toHaveValue('ab')
  })

  it('blocks changes while disabled', async () => {
    const onChange = vi.fn()
    render(<Input disabled onChange={onChange} />)

    const field = screen.getByRole('textbox')
    expect(field).toBeDisabled()

    await userEvent.type(field, 'ab')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('collapses keystrokes into a single debounced change', async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    })
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })
    const onChange = vi.fn()
    render(<Input debounce onChange={onChange} />)

    await user.type(screen.getByRole('textbox'), 'ab')
    expect(onChange).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(300)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('ab')
  })

  it('announces the busy state and drops the right section while loading', () => {
    const { rerender } = render(<Input rightSection={<span>clear</span>} />)
    expect(screen.getByText('clear')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-busy')

    rerender(<Input loading rightSection={<span>clear</span>} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('clear')).not.toBeInTheDocument()
  })

  it('blocks typing while loading', async () => {
    const onChange = vi.fn()
    render(<Input loading onChange={onChange} />)

    const field = screen.getByRole('textbox')
    expect(field).toBeDisabled()

    await userEvent.type(field, 'a')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders both sections around the field', () => {
    render(
      <Input leftSection={<span>R$</span>} rightSection={<span>kg</span>} />,
    )

    expect(screen.getByText('R$')).toBeInTheDocument()
    expect(screen.getByText('kg')).toBeInTheDocument()
  })

  it('reserves the default section width on each side', () => {
    render(
      <Input leftSection={<span>R$</span>} rightSection={<span>kg</span>} />,
    )

    expect(screen.getByRole('textbox')).toHaveStyle({
      paddingLeft: '36px',
      paddingRight: '36px',
    })
  })

  it('reserves the section width it was asked for', () => {
    render(
      <Input
        leftSection={<span>R$</span>}
        leftSectionWidth={64}
        rightSection={<span>kg</span>}
        rightSectionWidth={80}
      />,
    )

    expect(screen.getByRole('textbox')).toHaveStyle({
      paddingLeft: '64px',
      paddingRight: '80px',
    })
  })

  it('sizes each section to the width it reserved on the field', () => {
    render(
      <Input
        leftSection={<span>R$</span>}
        leftSectionWidth={64}
        rightSection={<span>kg</span>}
        rightSectionWidth={80}
      />,
    )

    expect(screen.getByTestId('input-section-left')).toHaveStyle({
      width: '64px',
    })
    expect(screen.getByTestId('input-section-right')).toHaveStyle({
      width: '80px',
    })
  })

  it('leaves both sides unpadded when it has no sections', () => {
    render(<Input />)

    expect(screen.getByRole('textbox')).not.toHaveStyle({
      paddingLeft: '36px',
    })
  })

  it('renders a text field unless another type is asked for', () => {
    const { rerender } = render(<Input />)
    expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'text')

    rerender(<Input type="password" />)
    expect(screen.getByTestId('input-field')).toHaveAttribute(
      'type',
      'password',
    )
  })

  it('forwards its ref to the field the user types into', async () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('textbox'))

    ref.current?.focus()
    await userEvent.keyboard('a')
    expect(screen.getByRole('textbox')).toHaveValue('a')
  })

  it('forwards native attributes to the field', () => {
    render(<Input aria-invalid="true" name="email" readOnly />)

    const field = screen.getByRole('textbox')
    expect(field).toHaveAttribute('name', 'email')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAttribute('readonly')
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Input size %s', (size) => {
  it('stays a reachable field', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} size={size} />)

    await userEvent.type(screen.getByRole('textbox'), 'a')

    expect(onChange).toHaveBeenLastCalledWith('a')
  })
})

describe.each(['default', 'ghost'] as const)('Input variant %s', (variant) => {
  it('stays a reachable field', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} variant={variant} />)

    await userEvent.type(screen.getByRole('textbox'), 'a')

    expect(onChange).toHaveBeenLastCalledWith('a')
  })
})

describe('Input root', () => {
  it('keeps the field reachable when the root carries extra classes', async () => {
    const onChange = vi.fn()
    render(
      <Input className="w-40" onChange={onChange} rootClassName="max-w-xs" />,
    )

    await userEvent.type(screen.getByRole('textbox'), 'a')

    expect(onChange).toHaveBeenLastCalledWith('a')
  })
})
