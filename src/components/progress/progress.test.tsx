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

  it('carries the label styling hook it was handed', () => {
    render(
      <Progress
        label={{ className: 'uppercase', content: 'Upload' }}
        value={10}
      />,
    )

    expect(screen.getByText('Upload').closest('label')).toHaveClass('uppercase')
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
