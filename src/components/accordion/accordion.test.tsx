import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Accordion } from './accordion'

function items() {
  return (
    <>
      <Accordion.Item value="a">
        <Accordion.Trigger>Item A</Accordion.Trigger>
        <Accordion.Content>Body A</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Trigger>Item B</Accordion.Trigger>
        <Accordion.Content>Body B</Accordion.Content>
      </Accordion.Item>
    </>
  )
}

describe('Accordion single', () => {
  it('keeps every panel closed until a trigger is used', () => {
    render(<Accordion type="single">{items()}</Accordion>)

    expect(screen.getByRole('button', { name: 'Item A' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('delivers the value of the item the user opened', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="single">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(onChange).toHaveBeenCalledWith('a')
    expect(screen.getByText('Body A')).toBeInTheDocument()
  })

  it('closes the previous item when another one opens', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="single">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))
    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(onChange).toHaveBeenLastCalledWith('b')
    expect(screen.getByText('Body B')).toBeInTheDocument()
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('delivers null when the open item is closed again', async () => {
    const onChange = vi.fn()
    render(
      <Accordion defaultValue="a" onChange={onChange} type="single">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('holds the last open item when it is not collapsible', async () => {
    const onChange = vi.fn()
    render(
      <Accordion
        collapsible={false}
        defaultValue="a"
        onChange={onChange}
        type="single"
      >
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(screen.getByText('Body A')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('still moves between items when it is not collapsible', async () => {
    const onChange = vi.fn()
    render(
      <Accordion
        collapsible={false}
        defaultValue="a"
        onChange={onChange}
        type="single"
      >
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.getByText('Body B')).toBeInTheDocument()
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('opens the item named by defaultValue and then follows the user', async () => {
    render(
      <Accordion defaultValue="a" type="single">
        {items()}
      </Accordion>,
    )

    expect(screen.getByText('Body A')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(screen.getByText('Body B')).toBeInTheDocument()
  })

  it('starts closed when defaultValue is empty', () => {
    render(
      <Accordion defaultValue="" type="single">
        {items()}
      </Accordion>,
    )

    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })

  it('keeps the controlled item open until the owner changes it', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="single" value="a">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.getByText('Body A')).toBeInTheDocument()
    expect(screen.queryByText('Body B')).not.toBeInTheDocument()
  })

  it('shows nothing when the controlled value is empty', () => {
    render(
      <Accordion type="single" value="">
        {items()}
      </Accordion>,
    )

    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
    expect(screen.queryByText('Body B')).not.toBeInTheDocument()
  })

  it('opens without an onChange listener', async () => {
    render(<Accordion type="single">{items()}</Accordion>)

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(screen.getByText('Body A')).toBeInTheDocument()
  })
})

describe('Accordion multiple', () => {
  it('delivers the full list of open items', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="multiple">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))
    expect(onChange).toHaveBeenCalledWith(['a'])

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'])
  })

  it('leaves the other panels open', async () => {
    render(
      <Accordion defaultValue={['a']} type="multiple">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(screen.getByText('Body A')).toBeInTheDocument()
    expect(screen.getByText('Body B')).toBeInTheDocument()
  })

  it('keeps the controlled list until the owner changes it', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="multiple" value={['a']}>
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item B' }))

    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
    expect(screen.getByText('Body A')).toBeInTheDocument()
    expect(screen.queryByText('Body B')).not.toBeInTheDocument()
  })
})

describe('Accordion.Item', () => {
  it('blocks a disabled item from opening', async () => {
    const onChange = vi.fn()
    render(
      <Accordion onChange={onChange} type="single">
        <Accordion.Item disabled value="a">
          <Accordion.Trigger>Item A</Accordion.Trigger>
          <Accordion.Content>Body A</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )

    const trigger = screen.getByRole('button', { name: 'Item A' })
    expect(trigger).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(trigger)

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByText('Body A')).not.toBeInTheDocument()
  })
})

describe.each([true, false])('Accordion bordered %s', (bordered) => {
  it('still opens the panel of the item that was clicked', async () => {
    render(
      <Accordion bordered={bordered} type="single">
        {items()}
      </Accordion>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Item A' }))

    expect(screen.getByRole('region')).toHaveTextContent('Body A')
  })
})
