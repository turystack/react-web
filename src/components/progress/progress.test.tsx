import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Progress, progressStyles } from './progress'

describe('Progress', () => {
  it('reports the value it was given against its bounds', () => {
    render(<Progress value={65} />)

    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '65')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('reports the defaultValue while no value is given', () => {
    render(<Progress defaultValue={30} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '30',
    )
  })

  it('follows the value it was given and never the defaultValue', () => {
    const { rerender } = render(<Progress defaultValue={30} value={70} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '70',
    )

    rerender(<Progress defaultValue={90} value={70} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '70',
    )
  })

  it('moves when the value it is given moves', () => {
    const { rerender } = render(<Progress value={10} />)

    rerender(<Progress value={80} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '80',
    )
  })

  it('keeps the value it started with when the defaultValue moves', () => {
    const { rerender } = render(<Progress defaultValue={30} />)

    rerender(<Progress defaultValue={90} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '30',
    )
  })

  it('reports itself indeterminate with no value at all', () => {
    render(<Progress />)

    const bar = screen.getByRole('progressbar')
    expect(bar).not.toHaveAttribute('aria-valuenow')
    expect(bar).toHaveAttribute('data-indeterminate')
  })

  it('reports itself complete at the maximum', () => {
    render(<Progress value={100} />)

    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '100')
    expect(bar).toHaveAttribute('data-complete')
  })

  it('renders a string label above the bar', () => {
    render(<Progress label="Upload" value={10} />)

    expect(screen.getByText('Upload')).toBeInTheDocument()
  })

  it('renders the content of a label object', () => {
    render(<Progress label={{ content: 'Upload' }} value={10} />)

    expect(screen.getByText('Upload')).toBeInTheDocument()
  })

  it('marks a required label', () => {
    render(
      <Progress label={{ content: 'Upload', required: true }} value={10} />,
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('marks an optional label', () => {
    render(
      <Progress label={{ content: 'Upload', optional: true }} value={10} />,
    )

    expect(screen.getByText('(optional)')).toBeInTheDocument()
  })

  it('dims a label marked disabled', () => {
    render(
      <Progress label={{ content: 'Upload', disabled: true }} value={10} />,
    )

    expect(screen.getByText('Upload')).toBeInTheDocument()
  })

  it('offers the tooltip affordance of a label object', () => {
    render(
      <Progress
        label={{ content: 'Upload', tooltip: 'Size on disk' }}
        value={10}
      />,
    )

    expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument()
  })

  it('renders no label when none was given', () => {
    render(<Progress value={10} />)

    expect(screen.queryByTestId('progress-label')).not.toBeInTheDocument()
  })

  it('points the label at the field it was told to', () => {
    render(
      <Progress label={{ content: 'Upload', htmlFor: 'upload' }} value={10} />,
    )

    expect(screen.getByText('Upload').closest('label')).toHaveAttribute(
      'for',
      'upload',
    )
  })

  it('forwards the semantic label props it was handed', () => {
    render(
      <Progress label={{ content: 'Upload', required: true }} value={10} />,
    )

    expect(screen.getByText('Upload').closest('label')?.textContent).toContain(
      '*',
    )
  })
})

describe('Progress name', () => {
  it('is named by ariaLabel when there is no visible label', () => {
    render(<Progress ariaLabel="3 of 7 done" value={43} />)

    expect(
      screen.getByRole('progressbar', { name: '3 of 7 done' }),
    ).toBeInTheDocument()
  })

  it('is named by its visible label', () => {
    render(<Progress label="Upload" value={10} />)

    expect(
      screen.getByRole('progressbar', { name: 'Upload' }),
    ).toBeInTheDocument()
  })

  it('is named by the content of a label object', () => {
    render(<Progress label={{ content: 'Upload' }} value={10} />)

    expect(
      screen.getByRole('progressbar', { name: 'Upload' }),
    ).toBeInTheDocument()
  })

  it('takes ariaLabel over the visible label', () => {
    render(<Progress ariaLabel="Upload, 10%" label="Upload" value={10} />)

    const bar = screen.getByRole('progressbar', { name: 'Upload, 10%' })
    expect(bar).not.toHaveAttribute('aria-labelledby')
  })

  it('stays unnamed with neither', () => {
    render(<Progress value={10} />)

    const bar = screen.getByRole('progressbar')
    expect(bar).not.toHaveAttribute('aria-label')
    expect(bar).not.toHaveAttribute('aria-labelledby')
  })
})

describe('Progress indeterminate', () => {
  it('gives the bar a width to fall back on while the value is unknown', () => {
    const indicator = progressStyles().indicator().split(' ')

    expect(indicator).toContain('w-0')
    expect(indicator).not.toContain('w-full')
  })

  it('marks the bar itself indeterminate, not only the root', () => {
    render(<Progress />)

    expect(screen.getByTestId('progress-indicator')).toHaveAttribute(
      'data-indeterminate',
    )
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Progress size %s', (size) => {
  it('still reports its value', () => {
    render(<Progress size={size} value={40} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
  })
})

describe('Progress axes', () => {
  it('publishes its default size for a theme to select', () => {
    render(<Progress value={40} />)

    expect(screen.getByTestId('progress-root')).toHaveAttribute(
      'data-size',
      'md',
    )
  })

  it('publishes the size it was given', () => {
    render(<Progress size="sm" value={40} />)

    expect(screen.getByTestId('progress-root')).toHaveAttribute(
      'data-size',
      'sm',
    )
  })
})
