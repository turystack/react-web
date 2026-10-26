import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Input } from './input'
import { ComposedInput } from './input.composed'

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

  it('keeps every keystroke of a controlled debounced field', async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    })
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    })
    const onChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState<string | null>(null)
      return (
        <>
          <Input
            debounce
            onChange={(next) => {
              onChange(next)
              setValue(next)
            }}
            value={value}
          />
          <button onClick={() => setValue(null)} type="button">
            reset
          </button>
        </>
      )
    }
    render(<Controlled />)
    const field = screen.getByRole('textbox')

    await user.type(field, 'ab')
    expect(field).toHaveValue('ab')
    await vi.advanceTimersByTimeAsync(300)
    expect(onChange).toHaveBeenLastCalledWith('ab')

    // Typing on while the parent echoes 'ab' back keeps the newer letters.
    await user.type(field, 'c')
    expect(field).toHaveValue('abc')
    await vi.advanceTimersByTimeAsync(300)
    expect(onChange).toHaveBeenLastCalledWith('abc')
    expect(field).toHaveValue('abc')

    // A change the parent makes on its own still reaches the field.
    await user.click(screen.getByRole('button', { name: 'reset' }))
    expect(field).toHaveValue('')
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

  it('renders a text field unless a composer asks for another type', () => {
    const { rerender } = render(<Input />)
    expect(screen.getByTestId('input-field')).toHaveAttribute('type', 'text')

    rerender(<ComposedInput type="password" />)
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

  it('forwards the form-field attributes of its contract to the field', () => {
    render(
      <Input
        aria-describedby="email-error"
        aria-invalid
        autoComplete="email"
        autoFocus
        data-testid="email-field"
        form="signup"
        id="email"
        inputMode="email"
        maxLength={40}
        minLength={3}
        name="email"
        placeholder="you@example.com"
        readOnly
        required
      />,
    )

    const field = screen.getByRole('textbox')
    expect(field).toBe(screen.getByTestId('email-field'))
    expect(field).toHaveAttribute('id', 'email')
    expect(field).toHaveAttribute('name', 'email')
    expect(field).toHaveAttribute('form', 'signup')
    expect(field).toHaveAttribute('placeholder', 'you@example.com')
    expect(field).toHaveAttribute('autocomplete', 'email')
    expect(field).toHaveAttribute('inputmode', 'email')
    expect(field).toHaveAttribute('maxlength', '40')
    expect(field).toHaveAttribute('minlength', '3')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAttribute('aria-describedby', 'email-error')
    expect(field).toBeRequired()
    expect(field).toHaveAttribute('readonly')
    expect(field).toHaveFocus()
  })

  it('is named by ariaLabel', () => {
    render(<Input ariaLabel="Email" />)

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  })

  it('leaves the field valid and optional unless told otherwise', () => {
    render(<Input aria-invalid={false} />)

    const field = screen.getByRole('textbox')
    expect(field).toHaveAttribute('aria-invalid', 'false')
    expect(field).not.toBeRequired()
    expect(field).not.toHaveAttribute('readonly')
    expect(field).not.toHaveFocus()
  })

  it('reports focus, blur, key presses and clicks', async () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const onKeyDown = vi.fn()
    const onClick = vi.fn()
    render(
      <Input
        onBlur={onBlur}
        onClick={onClick}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />,
    )

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'Enter',
      }),
    )
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('stays blocked while loading even when told it is not disabled', () => {
    render(<Input disabled={false} loading />)

    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('never lets a class or a style from outside restyle the field', () => {
    render(
      <Input
        // @ts-expect-error — className and style are not part of the contract
        className="outside-class"
        style={{
          color: 'red',
        }}
      />,
    )

    const field = screen.getByRole('textbox')
    expect(field).not.toHaveClass('outside-class')
    expect(field).not.toHaveStyle({
      color: 'rgb(255, 0, 0)',
    })
  })
})

describe('ComposedInput', () => {
  it('marks the root and the field with the slot classes its composer hands it', () => {
    render(
      <ComposedInput fieldClass="date-input-root" rootClass="search-field" />,
    )

    expect(screen.getByRole('textbox')).toHaveClass('input-field')
    expect(screen.getByRole('textbox')).toHaveClass('date-input-root')
    expect(screen.getByTestId('input-root')).toHaveClass('search-field')
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

describe('Input axes', () => {
  it('publishes its default variant and size for a theme to select', () => {
    render(<Input ariaLabel="Name" />)

    const root = screen.getByTestId('input-root')
    expect(root).toHaveAttribute('data-variant', 'default')
    expect(root).toHaveAttribute('data-size', 'md')
  })

  it('publishes the variant and size it was given', () => {
    render(<Input ariaLabel="Name" size="lg" variant="ghost" />)

    const root = screen.getByTestId('input-root')
    expect(root).toHaveAttribute('data-variant', 'ghost')
    expect(root).toHaveAttribute('data-size', 'lg')
  })
})
