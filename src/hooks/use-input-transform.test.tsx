import { act, render, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useInputTransform } from './use-input-transform'

/** Groups digits in threes from the left, so the length changes as you type. */
const group = (raw: string) => {
  const digits = raw.replace(/\D/g, '')
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Renders a real field so the caret assertions run against a DOM node rather
 * than a mock. `document.execCommand`-free: the change event is dispatched the
 * way React sees it, with the value and caret the browser would report.
 */
function renderField(
  options: Parameters<typeof useInputTransform>[0] = {
    transform: (raw) => raw.toUpperCase(),
  },
) {
  const result = {
    input: null as HTMLInputElement | null,
  }

  function Field() {
    const field = useInputTransform(options)
    return <input {...field.props} />
  }

  const view = render(<Field />)
  result.input = view.container.querySelector('input')

  return result
}

/**
 * Types into the field the way a browser would: value first, then caret.
 *
 * The caret is set defensively because `number`, `email` and `date` inputs
 * have no selection and throw when asked to move one — the same reason the
 * hook guards its own call, and letting the helper throw instead would hide
 * whether the hook survives it.
 */
function type(input: HTMLInputElement, value: string, caret = value.length) {
  act(() => {
    input.focus()
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set
    setter?.call(input, value)
    try {
      input.setSelectionRange(caret, caret)
    } catch {
      // no selection on this input type
    }
    input.dispatchEvent(
      new Event('input', {
        bubbles: true,
      }),
    )
  })
}

describe('useInputTransform', () => {
  it('shows the transformed text while typing', () => {
    const { input } = renderField()

    type(input as HTMLInputElement, 'abc')

    expect(input?.value).toBe('ABC')
  })

  it('emits the transformed value, not what was typed', () => {
    const onChange = vi.fn()
    const { input } = renderField({
      onChange,
      transform: (raw) => raw.toUpperCase(),
    })

    type(input as HTMLInputElement, 'ab')

    expect(onChange).toHaveBeenCalledWith('AB', 'AB')
  })

  it('transforms defaultValue before the first keystroke', () => {
    const { result } = renderHook(() =>
      useInputTransform({
        defaultValue: 'ab',
        transform: (raw) => raw.toUpperCase(),
      }),
    )

    expect(result.current.display).toBe('AB')
  })

  it('transforms a controlled value', () => {
    const { result } = renderHook(() =>
      useInputTransform({
        transform: (raw) => raw.toUpperCase(),
        value: 'ab',
      }),
    )

    expect(result.current.display).toBe('AB')
  })

  it('parses the emitted value away from the displayed one', () => {
    const onChange = vi.fn()
    const { input } = renderField({
      onChange,
      parse: (display) => Number(display.replace(/\D/g, '')),
      transform: group,
    })

    type(input as HTMLInputElement, '1234')

    expect(input?.value).toBe('1.234')
    expect(onChange).toHaveBeenCalledWith(1234, '1.234')
  })

  describe('caret', () => {
    it('stays at the end when appending', () => {
      const { input } = renderField({
        transform: group,
      })

      type(input as HTMLInputElement, '1234')

      expect(input?.value).toBe('1.234')
      expect(input?.selectionStart).toBe(5)
    })

    it('stays with the typed character when the transform inserts ahead of it', () => {
      const { input } = renderField({
        transform: group,
      })

      // "1234567" with the caret after the fourth digit becomes "1.234.567",
      // and the caret belongs right after that same digit — at index 5, not
      // thrown to the end, which is what happens without alignment.
      type(input as HTMLInputElement, '1234567', 4)

      expect(input?.value).toBe('1.234.567')
      expect(input?.selectionStart).toBe(5)
    })

    it('survives a transform that changes the characters themselves', () => {
      const { input } = renderField({
        transform: (raw) => raw.toUpperCase(),
      })

      type(input as HTMLInputElement, 'abcd', 2)

      expect(input?.value).toBe('ABCD')
      expect(input?.selectionStart).toBe(2)
    })

    it('lands sensibly when the transform rejects the character typed', () => {
      const { input } = renderField({
        transform: (raw) => raw.replace(/\D/g, ''),
      })

      type(input as HTMLInputElement, '123')
      type(input as HTMLInputElement, '123a', 4)

      // The transform produced the same text, so React re-renders nothing and
      // restores the field itself. The caret must not be left past the end.
      expect(input?.value).toBe('123')
      expect(input?.selectionStart).toBe(3)
    })

    it('does not move when the field is not focused', () => {
      const { result } = renderHook(() =>
        useInputTransform({
          transform: group,
        }),
      )

      // Nothing to assert on the DOM here; what matters is that setValue on a
      // blurred field does not throw reaching for a selection.
      act(() => result.current.setValue('1234'))

      expect(result.current.display).toBe('1.234')
    })
  })

  it('runs setValue through the same transform', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useInputTransform({
        onChange,
        transform: group,
      }),
    )

    act(() => result.current.setValue('9876'))

    expect(result.current.display).toBe('9.876')
    expect(onChange).toHaveBeenCalledWith('9.876', '9.876')
  })

  it('leaves an input type that has no selection alone', () => {
    function Field() {
      const field = useInputTransform({
        transform: (raw) => raw.replace(/\D/g, ''),
      })
      return <input {...field.props} type="number" />
    }

    const view = render(<Field />)
    const input = view.container.querySelector('input') as HTMLInputElement

    // setSelectionRange throws InvalidStateError on a number input; the hook
    // must swallow that rather than take the render down with it.
    expect(() => type(input, '12')).not.toThrow()
    expect(input.value).toBe('12')
  })
})

describe('useInputTransform element compatibility', () => {
  it('binds to a textarea with the same props', () => {
    function Field() {
      const field = useInputTransform({
        transform: (raw) => raw.toUpperCase(),
      })
      return <textarea {...field.props} />
    }

    const view = render(<Field />)
    const textarea = view.container.querySelector(
      'textarea',
    ) as HTMLTextAreaElement

    act(() => {
      textarea.focus()
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set
      setter?.call(textarea, 'multi\nline')
      textarea.setSelectionRange(10, 10)
      textarea.dispatchEvent(
        new Event('input', {
          bubbles: true,
        }),
      )
    })

    expect(textarea.value).toBe('MULTI\nLINE')
  })
})
