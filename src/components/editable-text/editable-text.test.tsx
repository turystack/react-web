import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { EditableText } from './editable-text'

function Controlled() {
  const [name, setName] = useState<string | null>('Ada')

  return <EditableText onChange={setName} value={name} />
}

describe('EditableText', () => {
  it('shows the value it was given', () => {
    render(<EditableText value="Ada" />)

    expect(screen.getByTestId('editable-text-value')).toHaveTextContent('Ada')
  })

  it('stands in for an empty value', () => {
    render(
      <>
        <EditableText value={null} />
        <EditableText placeholder="No name yet" value="" />
      </>,
    )

    const [fallback, custom] = screen.getAllByTestId('editable-text-value')

    expect(fallback).toHaveTextContent('Empty')
    expect(custom).toHaveTextContent('No name yet')
  })

  it('renders the value through a renderer when given one', () => {
    render(
      <EditableText
        renderValue={(value) => <strong>{value}</strong>}
        value="Ada"
      />,
    )

    expect(screen.getByText('Ada').tagName).toBe('STRONG')
  })

  it('turns into a field on click', async () => {
    render(<EditableText value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))

    expect(screen.getByTestId('editable-text-input')).toHaveValue('Ada')
  })

  it('opens from the keyboard, since the display is reachable', async () => {
    render(<EditableText value="Ada" />)

    screen.getByTestId('editable-text-display').focus()
    await userEvent.keyboard('{Enter}')

    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument()
  })

  it('commits on Enter and delivers the value', async () => {
    const onChange = vi.fn()

    render(<EditableText onChange={onChange} value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.clear(screen.getByTestId('editable-text-input'))
    await userEvent.type(screen.getByTestId('editable-text-input'), 'Grace')
    await userEvent.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith('Grace')
    expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument()
  })

  it('keeps the new value when nothing controls it', async () => {
    render(<EditableText defaultValue="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.clear(screen.getByTestId('editable-text-input'))
    await userEvent.type(screen.getByTestId('editable-text-input'), 'Grace')
    await userEvent.keyboard('{Enter}')

    expect(screen.getByTestId('editable-text-value')).toHaveTextContent('Grace')
  })

  it('follows the value the page controls', async () => {
    render(<Controlled />)

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.clear(screen.getByTestId('editable-text-input'))
    await userEvent.type(screen.getByTestId('editable-text-input'), 'Grace')
    await userEvent.keyboard('{Enter}')

    expect(screen.getByTestId('editable-text-value')).toHaveTextContent('Grace')
  })

  it('puts the old value back on Escape', async () => {
    const onChange = vi.fn()

    render(<EditableText defaultValue="Ada" onChange={onChange} />)

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.clear(screen.getByTestId('editable-text-input'))
    await userEvent.type(screen.getByTestId('editable-text-input'), 'Grace')
    await userEvent.keyboard('{Escape}')

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('editable-text-value')).toHaveTextContent('Ada')
  })

  it('commits when the field loses focus', async () => {
    const onChange = vi.fn()

    render(
      <>
        <EditableText onChange={onChange} value="Ada" />
        <button type="button">elsewhere</button>
      </>,
    )

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.clear(screen.getByTestId('editable-text-input'))
    await userEvent.type(screen.getByTestId('editable-text-input'), 'Grace')
    await userEvent.click(screen.getByText('elsewhere'))

    expect(onChange).toHaveBeenCalledWith('Grace')
  })

  it('leaves the editor open on blur when only the buttons commit', async () => {
    const onChange = vi.fn()

    render(
      <>
        <EditableText onChange={onChange} submitOn={['action']} value="Ada" />
        <button type="button">elsewhere</button>
      </>,
    )

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.click(screen.getByText('elsewhere'))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('editable-text-save'))

    expect(onChange).toHaveBeenCalledWith('Ada')
  })

  it('cancels from its own button', async () => {
    const onChange = vi.fn()

    render(<EditableText actions onChange={onChange} value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.click(screen.getByTestId('editable-text-cancel'))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument()
  })

  it('shows the message the app owns, without validating anything itself', () => {
    render(<EditableText error="Name already taken" value="Ada" />)

    expect(screen.getByTestId('editable-text-error')).toHaveTextContent(
      'Name already taken',
    )
  })

  it('refuses a commit when the save throws, and keeps the editor open', async () => {
    const onChange = vi.fn()

    render(
      <EditableText
        onChange={onChange}
        onSave={(next) => {
          if (!next) {
            throw new Error('A name is required')
          }
        }}
        value="Ada"
      />,
    )

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.clear(screen.getByTestId('editable-text-input'))
    await userEvent.keyboard('{Enter}')

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('editable-text-error')).toHaveTextContent(
      'A name is required',
    )
    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument()
  })

  it('blocks the editor while an async save runs and closes when it lands', async () => {
    let settle: () => void = () => {}
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          settle = resolve
        }),
    )

    render(<EditableText actions onSave={onSave} value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.click(screen.getByTestId('editable-text-save'))

    expect(screen.getByTestId('editable-text-input')).toBeDisabled()

    settle()

    await waitFor(() =>
      expect(
        screen.queryByTestId('editable-text-input'),
      ).not.toBeInTheDocument(),
    )
  })

  it('keeps the typing when the save is rejected', async () => {
    const onSave = vi.fn(() => Promise.reject(new Error('Name already taken')))

    render(<EditableText actions onSave={onSave} value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.click(screen.getByTestId('editable-text-save'))

    await waitFor(() =>
      expect(screen.getByTestId('editable-text-error')).toHaveTextContent(
        'Name already taken',
      ),
    )
    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument()
  })

  it('edits with any control the caller renders', async () => {
    const onChange = vi.fn()

    render(
      <EditableText<number> onChange={onChange} value={10}>
        {({ onChange: setDraft, onCommit, value }) => (
          <>
            <span data-testid="draft">{value}</span>
            <button onClick={() => setDraft(42)} type="button">
              set
            </button>
            <button onClick={onCommit} type="button">
              commit
            </button>
          </>
        )}
      </EditableText>,
    )

    await userEvent.click(screen.getByTestId('editable-text-display'))

    expect(screen.getByTestId('draft')).toHaveTextContent('10')

    await userEvent.click(screen.getByText('set'))
    await userEvent.click(screen.getByText('commit'))

    expect(onChange).toHaveBeenCalledWith(42)
  })

  it('writes into a textarea when the value is long', async () => {
    render(<EditableText multiline value="Notes" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))

    expect(screen.getByTestId('editable-text-input').tagName).toBe('TEXTAREA')
  })

  it('takes Enter as a newline in a textarea', async () => {
    const onChange = vi.fn()

    render(<EditableText multiline onChange={onChange} value="Notes" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.type(screen.getByTestId('editable-text-input'), '{Enter}')

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument()
  })

  it('opens from a pencil when the display is not the trigger', async () => {
    render(<EditableText trigger="icon" value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))

    expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('editable-text-edit'))

    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument()
  })

  it('waits for the second click when asked to', async () => {
    render(<EditableText trigger="doubleClick" value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))

    expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument()

    await userEvent.dblClick(screen.getByTestId('editable-text-display'))

    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument()
  })

  it('refuses to open while disabled', async () => {
    render(<EditableText disabled value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))

    expect(screen.queryByTestId('editable-text-input')).not.toBeInTheDocument()
  })

  it('lets the page own whether it is open', async () => {
    const onEditingChange = vi.fn()

    render(
      <EditableText editing onEditingChange={onEditingChange} value="Ada" />,
    )

    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    expect(onEditingChange).toHaveBeenCalledWith(false)
    expect(screen.getByTestId('editable-text-input')).toBeInTheDocument()
  })
})

describe('EditableText stable layout', () => {
  it('rests inside the field own box, transparent border included', () => {
    render(<EditableText layout="stable" value="Ada" />)

    const box = screen.getByTestId('editable-text-display').className

    expect(box).toContain('h-10')
    expect(box).toContain('px-2.5')
    expect(box).toContain('border-transparent')
  })

  it('gives the editor the very metrics the box reserved', async () => {
    render(<EditableText layout="stable" size="lg" value="Ada" />)

    expect(screen.getByTestId('editable-text-display').className).toContain(
      'h-11',
    )

    await userEvent.click(screen.getByTestId('editable-text-display'))

    expect(screen.getByTestId('editable-text-input').className).toContain(
      'h-11',
    )
  })

  it('keeps the box in the flow and draws the editor over it', async () => {
    render(<EditableText layout="stable" value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))

    const box = screen.getByTestId('editable-text-display')
    const overlay = screen.getByTestId('editable-text-overlay')

    expect(box).toBeInTheDocument()
    expect(box.className).toContain('invisible')
    expect(overlay.className).toContain('absolute')
  })

  it('draws an editor it cannot measure over the box as well', async () => {
    render(
      <EditableText<number> layout="stable" value={10}>
        {({ value }) => <span data-testid="custom-editor">{value}</span>}
      </EditableText>,
    )

    await userEvent.click(screen.getByTestId('editable-text-display'))

    expect(screen.getByTestId('editable-text-overlay')).toContainElement(
      screen.getByTestId('custom-editor'),
    )
  })

  it('overlays a textarea, which grows and would otherwise push the page', async () => {
    render(<EditableText layout="stable" multiline value="Notes" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))

    expect(screen.getByTestId('editable-text-input').tagName).toBe('TEXTAREA')
    expect(screen.getByTestId('editable-text-overlay')).toContainElement(
      screen.getByTestId('editable-text-input'),
    )
  })

  it('reserves the right slot in both states, so the text never shifts', async () => {
    render(<EditableText actions layout="stable" value="Ada" />)

    expect(screen.getByTestId('editable-text-display').className).toContain(
      'pr-9',
    )

    await userEvent.click(screen.getByTestId('editable-text-display'))

    expect(screen.getByTestId('input-section-right')).toBeInTheDocument()
    expect(screen.getByTestId('editable-text-save')).toBeInTheDocument()
  })

  it('reserves nothing when the editor will have nothing on the right', () => {
    render(<EditableText layout="stable" value="Ada" />)

    expect(screen.getByTestId('editable-text-display').className).not.toContain(
      'pr-9',
    )
  })

  it('takes the error out of the flow', () => {
    render(
      <EditableText error="Name already taken" layout="stable" value="Ada" />,
    )

    expect(screen.getByTestId('editable-text-error').className).toContain(
      'absolute',
    )
  })

  it('fills its container, so a longer value cannot reflow the row either', () => {
    render(<EditableText layout="stable" value="Ada" />)

    expect(screen.getByTestId('editable-text').className).toContain('w-full')
    expect(screen.getByTestId('editable-text-display').className).toContain(
      'w-full',
    )
  })

  it('still commits, cancels and refuses the way the flow layout does', async () => {
    const onChange = vi.fn()

    render(<EditableText layout="stable" onChange={onChange} value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.clear(screen.getByTestId('editable-text-input'))
    await userEvent.type(screen.getByTestId('editable-text-input'), 'Grace')
    await userEvent.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith('Grace')
    expect(
      screen.queryByTestId('editable-text-overlay'),
    ).not.toBeInTheDocument()
  })

  it('puts focus back on the value when the editor closes', async () => {
    render(<EditableText layout="stable" value="Ada" />)

    await userEvent.click(screen.getByTestId('editable-text-display'))
    await userEvent.keyboard('{Escape}')

    expect(screen.getByTestId('editable-text-display')).toHaveFocus()
  })
})
