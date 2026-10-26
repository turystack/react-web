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
  it('names the tablist with ariaLabel', () => {
    render(
      <Tabs defaultValue="a">
        <Tabs.List ariaLabel="Account sections">
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
      </Tabs>,
    )

    expect(
      screen.getByRole('tablist', { name: 'Account sections' }),
    ).toBeInTheDocument()
  })

  it('leaves the tablist unnamed without ariaLabel', () => {
    renderTabs({ defaultValue: 'a' })

    expect(screen.getByRole('tablist')).not.toHaveAttribute('aria-label')
    expect(screen.getByRole('tablist')).toHaveAccessibleName('')
  })

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

  it('aligns the triggers of a full-width rail to the start by default', () => {
    renderTabs({ block: true, defaultValue: 'a' })

    const list = screen.getByRole('tablist')
    expect(list).toHaveAttribute('data-justify', 'start')
    expect(list).toHaveClass('justify-start')
    expect(list).not.toHaveClass('justify-center')
  })

  it.each([
    ['center', 'justify-center'],
    ['between', 'justify-between'],
  ] as const)('distributes the triggers with justify=%s', (justify, token) => {
    renderTabs({ block: true, defaultValue: 'a', justify })

    const list = screen.getByRole('tablist')
    expect(list).toHaveAttribute('data-justify', justify)
    expect(list).toHaveClass(token)
    expect(list).not.toHaveClass('justify-start')
  })

  it('lets the list override the justify it inherits from the root', () => {
    render(
      <Tabs block defaultValue="a" justify="center">
        <Tabs.List block justify="between">
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
      </Tabs>,
    )

    expect(screen.getByRole('tablist')).toHaveAttribute(
      'data-justify',
      'between',
    )
  })

  it('inherits justify from the root', () => {
    render(
      <Tabs block defaultValue="a" justify="center">
        <Tabs.List>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
      </Tabs>,
    )

    expect(screen.getByRole('tablist')).toHaveAttribute(
      'data-justify',
      'center',
    )
  })

  it('leaves justify out of a rail that is not block', () => {
    renderTabs({ defaultValue: 'a' })

    expect(screen.getByRole('tablist')).not.toHaveAttribute('data-justify')
  })

  it('refuses justify without block', () => {
    render(
      // @ts-expect-error justify only applies to a block rail
      <Tabs defaultValue="a" justify="center">
        <Tabs.List>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
      </Tabs>,
    )

    expect(screen.getByRole('tablist')).not.toHaveAttribute('data-justify')
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

describe('Tabs axes', () => {
  it('publishes its default variant for a theme to select', () => {
    renderTabs({ defaultValue: 'a' })

    expect(screen.getByTestId('tabs-root')).toHaveAttribute(
      'data-variant',
      'line',
    )
    expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'line')
  })

  it('publishes the variant it was given, and a list override on the list', () => {
    render(
      <Tabs defaultValue="a" variant="pill">
        <Tabs.List variant="line">
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
      </Tabs>,
    )

    expect(screen.getByTestId('tabs-root')).toHaveAttribute(
      'data-variant',
      'pill',
    )
    expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'line')
  })
})

describe('Tabs disabledReason', () => {
  const reason = 'Upgrade to see billing'

  function renderBlocked(onChange = vi.fn()) {
    render(
      <Tabs defaultValue="a" onChange={onChange}>
        <Tabs.List>
          <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
          <Tabs.Trigger disabledReason={reason} value="b">
            Billing
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs>,
    )
    return screen.getByRole('tab', { name: 'Billing' })
  }

  it('renders no wrapper and no description without a reason', () => {
    renderTabs({ defaultValue: 'a' })

    for (const tab of screen.getAllByRole('tab')) {
      expect(tab).not.toHaveAttribute('aria-describedby')
    }
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('is blocked but arrow keys still reach it', async () => {
    const onChange = vi.fn()
    const tab = renderBlocked(onChange)

    expect(tab).toHaveAttribute('aria-disabled', 'true')
    expect(tab).not.toHaveAttribute('disabled')

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    expect(tab).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(tab, { pointerEventsCheck: 0 })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel A')
  })

  it('is described by the reason before any tooltip opens', () => {
    expect(renderBlocked()).toHaveAccessibleDescription(reason)
  })

  it('shows the reason when keyboard focus reaches it', async () => {
    renderBlocked()

    await userEvent.tab()
    expect(
      screen.queryByTestId('disabled-reason-popup'),
    ).not.toBeInTheDocument()
    await userEvent.keyboard('{ArrowRight}')

    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)
  })

  it('stretches its wrapper like a trigger in a justified list', () => {
    renderBlocked()

    expect(screen.getByRole('tablist')).toHaveClass(
      '*:data-[slot=disabled-reason]:flex-1',
    )
  })
})

describe('Tabs.Trigger disabledReason, edge cases', () => {
  const reason = 'Upgrade to see reports'

  function Reports({ blocked }: { blocked: boolean }) {
    return (
      <Tabs defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">Overview</Tabs.Trigger>
          <Tabs.Trigger disabledReason={blocked ? reason : undefined} value="b">
            Reports
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs>
    )
  }

  it('keeps focus when a reason arrives on the focused trigger', async () => {
    const { rerender } = render(<Reports blocked={false} />)
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')
    const reports = () => screen.getByRole('tab', { name: 'Reports' })
    expect(reports()).toHaveFocus()

    rerender(<Reports blocked />)

    expect(reports()).toHaveAttribute('aria-disabled', 'true')
    expect(reports()).toHaveFocus()
    expect(reports()).toHaveAccessibleDescription(reason)
  })

  it('fills its share of a justified list', () => {
    render(<Reports blocked />)

    // jsdom has no layout: the classes that size the wrapper and make the
    // trigger fill it are the claim.
    const wrapper = screen
      .getByRole('tab', { name: 'Reports' })
      .closest('[data-slot="disabled-reason"]')
    expect(screen.getByTestId('tabs-list')).toHaveClass(
      'grid',
      'auto-cols-fr',
      '*:data-[slot=disabled-reason]:flex-1',
    )
    expect(wrapper).toHaveClass('*:grow', '*:min-w-0')
  })
})
