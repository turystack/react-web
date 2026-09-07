import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SegmentedControl } from './segmented-control'

type View = {
  blocked?: boolean
  id: number
  name: string
}

const VIEWS: View[] = [
  {
    id: 1,
    name: 'List',
  },
  {
    id: 2,
    name: 'Board',
  },
  {
    blocked: true,
    id: 3,
    name: 'Calendar',
  },
]

function Controlled() {
  const [view, setView] = useState(1)

  return (
    <>
      <SegmentedControl
        onChange={setView}
        optionLabel="name"
        optionValue="id"
        options={VIEWS}
        value={view}
      />
      <span data-testid="selection">{view}</span>
    </>
  )
}

describe('SegmentedControl', () => {
  it('renders one segment per option', () => {
    render(
      <SegmentedControl optionLabel="name" optionValue="id" options={VIEWS} />,
    )

    expect(screen.getAllByTestId('segmented-control-segment')).toHaveLength(3)
    expect(screen.getByText('Board')).toBeInTheDocument()
  })

  it('is a radio group, so assistive technology knows what it is', () => {
    render(
      <SegmentedControl
        ariaLabel="View"
        optionLabel="name"
        optionValue="id"
        options={VIEWS}
      />,
    )

    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('delivers the option value, not a string key', async () => {
    const onChange = vi.fn()

    render(
      <SegmentedControl
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={VIEWS}
      />,
    )

    await userEvent.click(screen.getByText('Board'))

    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('reads the value an extractor builds', async () => {
    const onChange = vi.fn()

    render(
      <SegmentedControl
        onChange={onChange}
        optionLabel={(option) => option.name.toUpperCase()}
        optionValue={(option) => `view-${option.id}`}
        options={VIEWS}
      />,
    )

    expect(screen.getByText('BOARD')).toBeInTheDocument()

    await userEvent.click(screen.getByText('BOARD'))

    expect(onChange).toHaveBeenCalledWith('view-2')
  })

  it('follows the value it is controlled with', async () => {
    render(<Controlled />)

    await userEvent.click(screen.getByText('Board'))

    expect(screen.getByTestId('selection')).toHaveTextContent('2')
    expect(screen.getByRole('radio', { name: 'Board' })).toBeChecked()
  })

  it('starts on the uncontrolled default', () => {
    render(
      <SegmentedControl
        defaultValue={2}
        optionLabel="name"
        optionValue="id"
        options={VIEWS}
      />,
    )

    expect(screen.getByRole('radio', { name: 'Board' })).toBeChecked()
  })

  it('refuses a segment its own option disabled', async () => {
    const onChange = vi.fn()

    render(
      <SegmentedControl
        onChange={onChange}
        optionDisabled="blocked"
        optionLabel="name"
        optionValue="id"
        options={VIEWS}
      />,
    )

    await userEvent.click(screen.getByText('Calendar'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('blocks every segment while disabled', async () => {
    const onChange = vi.fn()

    render(
      <SegmentedControl
        disabled
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={VIEWS}
      />,
    )

    await userEvent.click(screen.getByText('Board'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows the choice and refuses to change it while read only', async () => {
    const onChange = vi.fn()

    render(
      <SegmentedControl
        defaultValue={1}
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={VIEWS}
        readOnly
      />,
    )

    await userEvent.click(screen.getByText('Board'))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: 'List' })).toBeChecked()
  })

  it('spins on the selection and blocks interaction while loading', async () => {
    const onChange = vi.fn()

    render(
      <SegmentedControl
        loading
        onChange={onChange}
        optionLabel="name"
        optionValue="id"
        options={VIEWS}
        value={1}
      />,
    )

    await userEvent.click(screen.getByText('Board'))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('loader')).toBeInTheDocument()
  })
})
