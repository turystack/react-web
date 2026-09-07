import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Tabs } from './tabs'

function renderTabs(props: React.ComponentProps<typeof Tabs> = {}) {
  return render(
    <Tabs {...props}>
      <Tabs.List>
        <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">Panel A</Tabs.Content>
      <Tabs.Content value="b">Panel B</Tabs.Content>
    </Tabs>,
  )
}

describe('Tabs', () => {
  it('shows the panel of the tab that starts active', () => {
    renderTabs({ defaultValue: 'a' })

    expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel A')
  })

  it('delivers the value of the tab the user activated', async () => {
    const onChange = vi.fn()
    renderTabs({ defaultValue: 'a', onChange })

    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }))

    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('swaps the visible panel when uncontrolled', async () => {
    renderTabs({ defaultValue: 'a' })

    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }))

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B')
    expect(screen.queryByText('Panel A')).not.toBeInTheDocument()
  })

  it('keeps the controlled tab active until the owner changes it', async () => {
    const onChange = vi.fn()
    renderTabs({ onChange, value: 'a' })

    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }))

    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel A')
    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('still switches when no onChange is given', async () => {
    renderTabs({ defaultValue: 'a' })

    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }))

    expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('blocks activation of a disabled trigger', async () => {
    const onChange = vi.fn()
    render(
      <Tabs defaultValue="a" onChange={onChange}>
        <Tabs.List>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
          <Tabs.Trigger disabled value="b">
            Tab B
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs>,
    )

    const disabled = screen.getByRole('tab', { name: 'Tab B' })
    expect(disabled).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(disabled)

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel A')
  })

  it('renders the icon inside the trigger label', () => {
    render(
      <Tabs defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger icon={<span>star</span>} value="a">
            Tab A
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
      </Tabs>,
    )

    expect(screen.getByRole('tab', { name: 'starTab A' })).toBeInTheDocument()
  })

  it('activates a focused tab from the keyboard', async () => {
    const onChange = vi.fn()
    renderTabs({ defaultValue: 'a', onChange })

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    await userEvent.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith('b')
  })
})

describe.each(['horizontal', 'vertical'] as const)(
  'Tabs orientation %s',
  (orientation) => {
    it('announces the orientation and stays operable', async () => {
      const onChange = vi.fn()
      renderTabs({ defaultValue: 'a', onChange, orientation })

      expect(screen.getByRole('tablist')).toHaveAttribute(
        'data-orientation',
        orientation,
      )

      await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }))
      expect(onChange).toHaveBeenCalledWith('b')
    })
  },
)

describe.each(['line', 'pill'] as const)('Tabs variant %s', (variant) => {
  it('stays operable when set on the root', async () => {
    const onChange = vi.fn()
    renderTabs({ defaultValue: 'a', onChange, variant })

    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }))

    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('stays operable when overridden on the list', async () => {
    const onChange = vi.fn()
    render(
      <Tabs defaultValue="a" onChange={onChange} variant="line">
        <Tabs.List justified={false} variant={variant}>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
          <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs>,
    )

    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }))

    expect(onChange).toHaveBeenCalledWith('b')
  })
})

describe.each([true, false])('Tabs justified %s', (justified) => {
  it('keeps every trigger reachable', () => {
    renderTabs({ defaultValue: 'a', justified })

    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })
})

describe('Tabs block', () => {
  it('stretches the rail without stretching the triggers', () => {
    renderTabs({ block: true, defaultValue: 'a' })

    const list = screen.getByRole('tablist')
    expect(list).toHaveAttribute('data-block', 'true')
    expect(list).toHaveAttribute('data-justified', 'false')
  })

  it('justifies the triggers when block is not asked for', () => {
    renderTabs({ defaultValue: 'a' })

    const list = screen.getByRole('tablist')
    expect(list).toHaveAttribute('data-block', 'false')
    expect(list).toHaveAttribute('data-justified', 'true')
  })

  it('keeps every trigger operable', async () => {
    const onChange = vi.fn()
    renderTabs({ block: true, defaultValue: 'a', onChange })

    await userEvent.click(screen.getByRole('tab', { name: 'Tab B' }))

    expect(onChange).toHaveBeenCalledWith('b')
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('takes block from the list alone', () => {
    render(
      <Tabs defaultValue="a">
        <Tabs.List block>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
          <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs>,
    )

    const list = screen.getByRole('tablist')
    expect(list).toHaveAttribute('data-block', 'true')
    expect(list).toHaveAttribute('data-justified', 'false')
  })

  it('inherits block from the root', () => {
    render(
      <Tabs block defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
          <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs>,
    )

    expect(screen.getByRole('tablist')).toHaveAttribute('data-block', 'true')
  })

  it('works in both orientations', () => {
    const { rerender } = render(
      <Tabs block defaultValue="a" orientation="vertical">
        <Tabs.List>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
      </Tabs>,
    )

    expect(screen.getByRole('tablist')).toHaveAttribute('data-block', 'true')

    rerender(
      <Tabs block defaultValue="a" orientation="horizontal">
        <Tabs.List>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
      </Tabs>,
    )

    expect(screen.getByRole('tablist')).toHaveAttribute('data-block', 'true')
  })

  it('refuses block together with justified', () => {
    render(
      // @ts-expect-error block and justified are mutually exclusive
      <Tabs block defaultValue="a" justified>
        <Tabs.List>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
      </Tabs>,
    )

    expect(screen.getByRole('tablist')).toHaveAttribute('data-block', 'true')
  })

  it('refuses block together with justified on the list', () => {
    render(
      <Tabs defaultValue="a">
        {/* @ts-expect-error block and justified are mutually exclusive */}
        <Tabs.List block justified>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
      </Tabs>,
    )

    expect(screen.getByRole('tablist')).toHaveAttribute('data-block', 'true')
  })
})
