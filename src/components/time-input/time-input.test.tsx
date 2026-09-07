import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { TimeInput } from './time-input'

function hours() {
  return screen.getByRole('spinbutton', {
    name: 'hours',
  })
}

function minutes() {
  return screen.getByRole('spinbutton', {
    name: 'minutes',
  })
}

function seconds() {
  return screen.getByRole('spinbutton', {
    name: 'seconds',
  })
}

describe('TimeInput', () => {
  it('renders one segment per unit and no seconds by default', () => {
    render(<TimeInput />)

    expect(hours()).toBeInTheDocument()
    expect(minutes()).toBeInTheDocument()
    expect(
      screen.queryByRole('spinbutton', {
        name: 'seconds',
      }),
    ).not.toBeInTheDocument()
  })

  it('adds the seconds segment when withSeconds is set', () => {
    render(<TimeInput withSeconds />)

    expect(seconds()).toBeInTheDocument()
  })

  it('starts empty when it is given no value', () => {
    render(<TimeInput />)

    expect(hours()).toHaveValue('')
    expect(minutes()).toHaveValue('')
  })

  it('reads a null value as empty', () => {
    render(<TimeInput value={null} />)

    expect(hours()).toHaveValue('')
    expect(minutes()).toHaveValue('')
  })

  it('publishes the bounds of each segment', () => {
    render(<TimeInput value="08:30:15" withSeconds />)

    expect(hours()).toHaveAttribute('aria-valuemax', '23')
    expect(hours()).toHaveAttribute('aria-valuemin', '0')
    expect(minutes()).toHaveAttribute('aria-valuemax', '59')
    expect(seconds()).toHaveAttribute('aria-valuemax', '59')
    expect(hours()).toHaveAttribute('aria-valuenow', '8')
  })

  it('reads a value without seconds as empty when seconds are expected', () => {
    render(<TimeInput value="08:30" withSeconds />)

    expect(hours()).toHaveValue('')
    expect(minutes()).toHaveValue('')
  })

  it('reports an empty segment as zero to assistive technology', () => {
    render(<TimeInput />)

    expect(hours()).toHaveAttribute('aria-valuenow', '0')
  })
})

describe('TimeInput controlled and uncontrolled', () => {
  it('shows the controlled value and follows it when it changes', () => {
    const { rerender } = render(<TimeInput onChange={vi.fn()} value="08:30" />)

    expect(hours()).toHaveValue('08')
    expect(minutes()).toHaveValue('30')

    rerender(<TimeInput onChange={vi.fn()} value="10:45" />)

    expect(hours()).toHaveValue('10')
    expect(minutes()).toHaveValue('45')
  })

  it('does not move the controlled value on its own', () => {
    const { rerender } = render(<TimeInput onChange={vi.fn()} value="08:30" />)

    rerender(<TimeInput onChange={vi.fn()} value="08:30" />)

    expect(hours()).toHaveValue('08')
    expect(minutes()).toHaveValue('30')
  })

  it('clears the segments when the controlled value is withdrawn', () => {
    const { rerender } = render(<TimeInput onChange={vi.fn()} value="08:30" />)

    rerender(<TimeInput onChange={vi.fn()} value={null} />)

    expect(hours()).toHaveValue('')
    expect(minutes()).toHaveValue('')
  })

  it('changes on its own from a defaultValue', async () => {
    const onChange = vi.fn()
    render(<TimeInput defaultValue="08:30" onChange={onChange} />)

    await userEvent.type(hours(), '1')

    expect(hours()).toHaveValue('01')
    expect(onChange).toHaveBeenCalledWith('01:30')
  })

  it('keeps a controlled parent in charge of the value it stores', async () => {
    const onChange = vi.fn()

    function Controlled() {
      const [time, setTime] = useState<string | null>('08:30')
      return (
        <TimeInput
          onChange={(next) => {
            setTime(next)
            onChange(next)
          }}
          value={time}
        />
      )
    }

    render(<Controlled />)

    await userEvent.type(hours(), '1')

    expect(onChange).toHaveBeenCalledWith('01:30')
    expect(hours()).toHaveValue('01')
    expect(minutes()).toHaveValue('30')
  })
})

describe('TimeInput typing', () => {
  it('delivers the whole formatted time once every segment is filled', async () => {
    const onChange = vi.fn()
    render(<TimeInput onChange={onChange} />)

    await userEvent.type(hours(), '3')
    await userEvent.type(minutes(), '45')

    expect(onChange).toHaveBeenLastCalledWith('03:45')
  })

  it('delivers seconds too when withSeconds is set', async () => {
    const onChange = vi.fn()
    render(<TimeInput onChange={onChange} withSeconds />)

    await userEvent.type(hours(), '3')
    await userEvent.type(minutes(), '45')
    await userEvent.type(seconds(), '30')

    expect(onChange).toHaveBeenLastCalledWith('03:45:30')
  })

  it('delivers null while the entry is still partial', async () => {
    const onChange = vi.fn()
    render(<TimeInput onChange={onChange} />)

    await userEvent.type(hours(), '3')

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('moves to the next segment as soon as the digits cannot grow', async () => {
    render(<TimeInput />)

    await userEvent.type(hours(), '3')

    expect(minutes()).toHaveFocus()
  })

  it('waits for the second digit when the first one can still grow', async () => {
    render(<TimeInput />)

    await userEvent.type(hours(), '1')

    expect(hours()).toHaveFocus()
    expect(hours()).toHaveValue('01')
  })

  it('clamps an out-of-range entry to the segment maximum', async () => {
    const onChange = vi.fn()
    render(<TimeInput defaultValue="08:00" onChange={onChange} />)

    await userEvent.type(minutes(), '99')

    expect(minutes()).toHaveValue('59')
    expect(onChange).toHaveBeenLastCalledWith('08:59')
  })

  it('clamps an out-of-range hour to 23', async () => {
    const onChange = vi.fn()
    render(<TimeInput defaultValue="00:30" onChange={onChange} />)

    await userEvent.type(hours(), '25')

    expect(hours()).toHaveValue('23')
    expect(onChange).toHaveBeenLastCalledWith('23:30')
  })

  it('refuses anything that is not a digit', async () => {
    const onChange = vi.fn()
    render(<TimeInput onChange={onChange} />)

    await userEvent.type(hours(), 'a')

    expect(hours()).toHaveValue('')
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('selects the whole segment when it is clicked', async () => {
    render(<TimeInput defaultValue="08:30" />)

    const field = hours() as HTMLInputElement
    await userEvent.click(field)

    expect(field.selectionStart).toBe(0)
    expect(field.selectionEnd).toBe(2)
  })
})

describe('TimeInput keyboard', () => {
  it('spins the segment up by one', async () => {
    const onChange = vi.fn()
    render(<TimeInput defaultValue="08:30" onChange={onChange} />)

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowUp}')

    expect(onChange).toHaveBeenLastCalledWith('09:30')
  })

  it('spins the segment down by one', async () => {
    const onChange = vi.fn()
    render(<TimeInput defaultValue="08:30" onChange={onChange} />)

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowDown}')

    expect(onChange).toHaveBeenLastCalledWith('07:30')
  })

  it('starts an empty segment at its minimum when spun up', async () => {
    render(<TimeInput />)

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowUp}')

    expect(hours()).toHaveValue('00')
  })

  it('starts an empty segment at its maximum when spun down', async () => {
    render(<TimeInput />)

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowDown}')

    expect(hours()).toHaveValue('23')
  })

  it('stops spinning up at the segment maximum', async () => {
    render(<TimeInput defaultValue="23:30" />)

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowUp}')

    expect(hours()).toHaveValue('23')
  })

  it('stops spinning down at the segment minimum', async () => {
    render(<TimeInput defaultValue="00:30" />)

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowDown}')

    expect(hours()).toHaveValue('00')
  })

  it('walks right and left between segments', async () => {
    render(<TimeInput defaultValue="08:30:15" withSeconds />)

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowRight}')
    expect(minutes()).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    expect(seconds()).toHaveFocus()

    await userEvent.keyboard('{ArrowLeft}')
    expect(minutes()).toHaveFocus()

    await userEvent.keyboard('{ArrowLeft}')
    expect(hours()).toHaveFocus()
  })

  it('stays put at the ends of the group', async () => {
    render(<TimeInput defaultValue="08:30" />)

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowLeft}')
    expect(hours()).toHaveFocus()

    await userEvent.click(minutes())
    await userEvent.keyboard('{ArrowRight}')
    expect(minutes()).toHaveFocus()
  })

  it('clears the segment on Backspace and then steps back', async () => {
    const onChange = vi.fn()
    render(<TimeInput defaultValue="08:30" onChange={onChange} />)

    await userEvent.click(minutes())
    await userEvent.keyboard('{Backspace}')

    expect(minutes()).toHaveValue('')
    expect(onChange).toHaveBeenLastCalledWith(null)

    await userEvent.keyboard('{Backspace}')
    expect(hours()).toHaveFocus()
  })

  it('treats Delete like Backspace', async () => {
    const onChange = vi.fn()
    render(<TimeInput defaultValue="08:30" onChange={onChange} />)

    await userEvent.click(minutes())
    await userEvent.keyboard('{Delete}')

    expect(minutes()).toHaveValue('')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('moves on when zero is typed into a segment that already reads zero', async () => {
    render(<TimeInput defaultValue="00:30" />)

    await userEvent.click(hours())
    await userEvent.keyboard('0')

    expect(minutes()).toHaveFocus()
    expect(hours()).toHaveValue('00')
  })
})

describe('TimeInput paste', () => {
  it('fills the group from a pasted HH:MM', async () => {
    const onChange = vi.fn()
    render(<TimeInput onChange={onChange} />)

    await userEvent.click(hours())
    await userEvent.paste('12:34')

    expect(hours()).toHaveValue('12')
    expect(minutes()).toHaveValue('34')
    expect(onChange).toHaveBeenCalledWith('12:34')
  })

  it('fills the seconds too when they are expected', async () => {
    const onChange = vi.fn()
    render(<TimeInput onChange={onChange} withSeconds />)

    await userEvent.click(hours())
    await userEvent.paste('1:2:3')

    expect(seconds()).toHaveValue('03')
    expect(onChange).toHaveBeenCalledWith('01:02:03')
  })

  it('ignores a payload it cannot read', async () => {
    const onChange = vi.fn()
    render(<TimeInput onChange={onChange} />)

    await userEvent.click(hours())
    await userEvent.paste('lunchtime')

    expect(hours()).toHaveValue('')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clamps a pasted time into the allowed window', async () => {
    const onChange = vi.fn()
    render(<TimeInput maxTime="22:00" onChange={onChange} />)

    await userEvent.click(hours())
    await userEvent.paste('23:30')

    expect(onChange).toHaveBeenCalledWith('22:00')
  })

  it('refuses to paste while read only', async () => {
    const onChange = vi.fn()
    render(<TimeInput onChange={onChange} readOnly />)

    await userEvent.click(hours())
    await userEvent.paste('12:34')

    expect(hours()).toHaveValue('')
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('TimeInput bounds', () => {
  it('lifts a value below minTime when the group loses focus', async () => {
    const onChange = vi.fn()
    render(
      <div>
        <TimeInput defaultValue="06:00" minTime="08:00" onChange={onChange} />
        <button type="button">outside</button>
      </div>,
    )

    await userEvent.click(hours())
    await userEvent.click(
      screen.getByRole('button', {
        name: 'outside',
      }),
    )

    expect(hours()).toHaveValue('08')
    expect(onChange).toHaveBeenCalledWith('08:00')
  })

  it('drops a value above maxTime when the group loses focus', async () => {
    const onChange = vi.fn()
    render(
      <div>
        <TimeInput defaultValue="23:30" maxTime="22:00" onChange={onChange} />
        <button type="button">outside</button>
      </div>,
    )

    await userEvent.click(hours())
    await userEvent.click(
      screen.getByRole('button', {
        name: 'outside',
      }),
    )

    expect(hours()).toHaveValue('22')
    expect(minutes()).toHaveValue('00')
    expect(onChange).toHaveBeenCalledWith('22:00')
  })

  it('leaves a value inside the window alone', async () => {
    const onChange = vi.fn()
    render(
      <div>
        <TimeInput
          defaultValue="12:00"
          maxTime="22:00"
          minTime="08:00"
          onChange={onChange}
        />
        <button type="button">outside</button>
      </div>,
    )

    await userEvent.click(hours())
    await userEvent.click(
      screen.getByRole('button', {
        name: 'outside',
      }),
    )

    expect(hours()).toHaveValue('12')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('leaves a partial entry alone when the group loses focus', async () => {
    const onChange = vi.fn()
    render(
      <div>
        <TimeInput minTime="08:00" onChange={onChange} />
        <button type="button">outside</button>
      </div>,
    )

    await userEvent.type(hours(), '1')
    await userEvent.click(
      screen.getByRole('button', {
        name: 'outside',
      }),
    )

    expect(hours()).toHaveValue('01')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('waits for the seconds before clamping when they are expected', async () => {
    const onChange = vi.fn()
    render(
      <div>
        <TimeInput minTime="08:00:00" onChange={onChange} withSeconds />
        <button type="button">outside</button>
      </div>,
    )

    await userEvent.type(hours(), '6')
    await userEvent.type(minutes(), '00')
    await userEvent.click(
      screen.getByRole('button', {
        name: 'outside',
      }),
    )

    expect(hours()).toHaveValue('06')
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('clamps nothing when no window was given', async () => {
    const onChange = vi.fn()
    render(
      <div>
        <TimeInput defaultValue="06:00" onChange={onChange} />
        <button type="button">outside</button>
      </div>,
    )

    await userEvent.click(hours())
    await userEvent.click(
      screen.getByRole('button', {
        name: 'outside',
      }),
    )

    expect(hours()).toHaveValue('06')
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('TimeInput focus reporting', () => {
  it('reports the group gaining focus once, not once per segment', async () => {
    const onFocus = vi.fn()
    render(<TimeInput defaultValue="08:30" onFocus={onFocus} />)

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowRight}')

    expect(minutes()).toHaveFocus()
    expect(onFocus).toHaveBeenCalledTimes(1)
  })

  it('reports the group losing focus only when focus leaves it', async () => {
    const onBlur = vi.fn()
    render(
      <div>
        <TimeInput defaultValue="08:30" onBlur={onBlur} />
        <button type="button">outside</button>
      </div>,
    )

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowRight}')
    expect(onBlur).not.toHaveBeenCalled()

    await userEvent.click(
      screen.getByRole('button', {
        name: 'outside',
      }),
    )
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})

describe('TimeInput states', () => {
  it('blocks every segment when disabled', async () => {
    const onChange = vi.fn()
    render(<TimeInput defaultValue="08:30" disabled onChange={onChange} />)

    expect(hours()).toBeDisabled()
    expect(minutes()).toBeDisabled()

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowUp}')

    expect(hours()).toHaveValue('08')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows the value but refuses every edit when read only', async () => {
    const onChange = vi.fn()
    render(<TimeInput defaultValue="08:30" onChange={onChange} readOnly />)

    expect(hours()).toHaveAttribute('readonly')

    await userEvent.click(hours())
    await userEvent.keyboard('{ArrowUp}')
    await userEvent.type(hours(), '1')

    expect(hours()).toHaveValue('08')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows an indicator in place of the right section while loading', () => {
    render(
      <TimeInput
        loading
        rightSection={<span>right content</span>}
        value="08:30"
      />,
    )

    expect(screen.getByTestId('time-input-section-right')).toBeInTheDocument()
    expect(screen.queryByText('right content')).not.toBeInTheDocument()
  })
})

describe('TimeInput sections', () => {
  it('renders a clock on the left by default', () => {
    render(<TimeInput />)

    expect(screen.getByTestId('time-input-section-left')).toBeInTheDocument()
  })

  it('drops the left section when it is explicitly emptied', () => {
    render(<TimeInput leftSection={null} />)

    expect(
      screen.queryByTestId('time-input-section-left'),
    ).not.toBeInTheDocument()
  })

  it('renders the node given as the left section', () => {
    render(<TimeInput leftSection={<span>left content</span>} />)

    expect(screen.getByText('left content')).toBeInTheDocument()
  })

  it('renders the node given as the right section', () => {
    render(<TimeInput rightSection={<span>right content</span>} />)

    expect(screen.getByText('right content')).toBeInTheDocument()
  })

  it('renders no right section when none was asked for', () => {
    render(<TimeInput />)

    expect(
      screen.queryByTestId('time-input-section-right'),
    ).not.toBeInTheDocument()
  })

  it('accepts explicit section widths', () => {
    render(
      <TimeInput
        leftSectionWidth={48}
        rightSection={<span>right content</span>}
        rightSectionWidth={48}
      />,
    )

    expect(screen.getByTestId('time-input-section-left')).toBeInTheDocument()
    expect(screen.getByText('right content')).toBeInTheDocument()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('TimeInput size %s', (size) => {
  it('keeps every segment reachable', () => {
    render(<TimeInput size={size} value="08:30" />)

    expect(hours()).toHaveValue('08')
    expect(minutes()).toHaveValue('30')
  })
})

describe.each(['default', 'ghost'] as const)(
  'TimeInput variant %s',
  (variant) => {
    it('keeps every segment reachable', () => {
      render(<TimeInput value="08:30" variant={variant} />)

      expect(hours()).toHaveValue('08')
    })

    it('keeps every segment blocked when disabled', () => {
      render(<TimeInput disabled value="08:30" variant={variant} />)

      expect(hours()).toBeDisabled()
    })
  },
)

describe('TimeInput when the parent refuses an edit', () => {
  it('pulls the field back to the value the parent still wants', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<TimeInput value="08:30" />)

    await user.type(hours(), '1')

    rerender(<TimeInput value="08:30" />)

    expect(hours()).toHaveValue('08')
    expect(minutes()).toHaveValue('30')
  })

  it('pulls the field back after a second refused edit', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<TimeInput value="08:30" />)

    await user.type(minutes(), '4')
    rerender(<TimeInput value="08:30" />)
    expect(minutes()).toHaveValue('30')

    await user.type(minutes(), '5')
    rerender(<TimeInput value="08:30" />)
    expect(minutes()).toHaveValue('30')
  })

  it('takes the value the parent replaces the edit with', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<TimeInput value="08:30" />)

    await user.type(hours(), '1')

    rerender(<TimeInput value="09:45" />)

    expect(hours()).toHaveValue('09')
    expect(minutes()).toHaveValue('45')
  })

  it('leaves a half-typed time alone while the parent has nothing to show', async () => {
    function Host() {
      const [time, setTime] = useState<string | null>('08:30')
      return <TimeInput onChange={setTime} value={time} />
    }
    const user = userEvent.setup()
    render(<Host />)

    await user.clear(hours())

    expect(hours()).toHaveValue('')
    expect(minutes()).toHaveValue('30')
  })
})
