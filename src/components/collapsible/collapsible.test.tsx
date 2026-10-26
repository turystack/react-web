import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'

import { Collapsible } from './collapsible'

function Example(props: Parameters<typeof Collapsible>[0]) {
  return (
    <Collapsible {...props}>
      <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
      <Collapsible.Panel>the content</Collapsible.Panel>
    </Collapsible>
  )
}

describe('Collapsible', () => {
  it('starts closed and opens on the trigger', async () => {
    render(<Example />)

    expect(screen.queryByText('the content')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('collapsible-trigger'))

    expect(screen.getByText('the content')).toBeInTheDocument()
  })

  it('starts open when told to', () => {
    render(<Example defaultOpen />)

    expect(screen.getByText('the content')).toBeInTheDocument()
  })

  it('reports the change to the page that controls it', async () => {
    const onChange = vi.fn()

    render(<Example onChange={onChange} open={false} />)

    await userEvent.click(screen.getByTestId('collapsible-trigger'))

    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.queryByText('the content')).not.toBeInTheDocument()
  })

  it('tells assistive technology what the trigger controls', () => {
    render(<Example defaultOpen />)

    const trigger = screen.getByTestId('collapsible-trigger')

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls')
  })

  it('refuses to open while disabled', async () => {
    render(<Example disabled />)

    await userEvent.click(screen.getByTestId('collapsible-trigger'))

    expect(screen.queryByText('the content')).not.toBeInTheDocument()
  })

  it('keeps the content in the document when asked, so the browser can find it', () => {
    render(
      <Collapsible>
        <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
        <Collapsible.Panel keepMounted>
          <input aria-label="Code" />
        </Collapsible.Panel>
      </Collapsible>,
    )

    expect(screen.getByLabelText('Code')).toBeInTheDocument()
  })

  it('styles its own button trigger', () => {
    render(<Example />)

    expect(
      screen.getByRole('button', {
        name: 'Advanced options',
      }),
    ).toHaveClass('collapsible-trigger', 'w-full', 'justify-between')
  })

  it('leaves an asChild trigger with its own look and the disclosure behaviour', async () => {
    render(
      <Collapsible>
        <Collapsible.Trigger asChild>
          <Button variant="ghost">More</Button>
        </Collapsible.Trigger>
        <Collapsible.Panel>the content</Collapsible.Panel>
      </Collapsible>,
    )

    const trigger = screen.getByRole('button', {
      name: 'More',
    })

    expect(trigger).toHaveClass('button', 'justify-center')
    expect(trigger).not.toHaveClass('collapsible-trigger')
    expect(trigger).not.toHaveClass('w-full')
    expect(trigger).not.toHaveClass('justify-between')
    // The column root would stretch it; `self-start` keeps its own width.
    expect(trigger).toHaveClass('collapsible-own-trigger', 'self-start')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls')
    expect(screen.getByText('the content')).toBeInTheDocument()
  })

  describe('trigger sections', () => {
    function Summary(props: { open?: boolean }) {
      return (
        <Collapsible defaultOpen={props.open}>
          <Collapsible.Trigger
            description="Pro · a cada ano"
            indicator
            leftSection={<svg data-testid="summary-icon" />}
            rightSection="R$ 490,00"
          >
            Resumo do pedido
          </Collapsible.Trigger>
          <Collapsible.Panel>the lines</Collapsible.Panel>
        </Collapsible>
      )
    }

    it('lays a two-line trigger out without a block element inside the button', () => {
      render(<Summary />)

      const trigger = screen.getByRole('button', { name: 'Resumo do pedido' })
      expect(
        trigger.querySelector('div, p, h1, h2, h3, h4, h5, h6, ul, ol'),
      ).toBe(null)
      for (const child of Array.from(trigger.querySelectorAll('*'))) {
        expect(['span', 'svg', 'path', 'g', 'circle', 'rect']).toContain(
          child.tagName.toLowerCase(),
        )
      }
    })

    it('names the trigger by its title and describes it with the rest', () => {
      render(<Summary />)

      const trigger = screen.getByRole('button', { name: 'Resumo do pedido' })
      expect(trigger).toHaveAccessibleDescription('Pro · a cada ano R$ 490,00')
      expect(
        screen.getByTestId('collapsible-trigger-description'),
      ).toHaveTextContent('Pro · a cada ano')
    })

    it('orders left section, title, right section, then the chevron', () => {
      render(<Summary />)

      const children = Array.from(
        screen.getByTestId('collapsible-trigger').children,
      )
      const order = [
        'collapsible-trigger-left-section',
        'collapsible-trigger-body',
        'collapsible-trigger-right-section',
        'collapsible-trigger-indicator',
      ].map((id) => children.indexOf(screen.getByTestId(id)))
      expect(order).toEqual([0, 1, 2, 3])
      expect(
        screen.getByTestId('collapsible-trigger-left-section'),
      ).toContainElement(screen.getByTestId('summary-icon'))
    })

    it('centres the chevron on the whole trigger and turns it while open', () => {
      render(<Summary />)

      expect(screen.getByTestId('collapsible-trigger-indicator')).toHaveClass(
        'collapsible-trigger-indicator',
        'self-center',
        'group-aria-expanded/collapsible-trigger:rotate-180',
      )
      expect(screen.getByTestId('collapsible-trigger')).toHaveClass(
        'group/collapsible-trigger',
      )
    })

    it('opens the panel from a two-line trigger', async () => {
      render(<Summary />)

      const trigger = screen.getByRole('button', { name: 'Resumo do pedido' })
      await userEvent.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('the lines')).toBeInTheDocument()
    })

    it('draws no chevron unless asked', () => {
      render(<Example />)

      expect(
        screen.queryByTestId('collapsible-trigger-indicator'),
      ).not.toBeInTheDocument()
    })

    it('draws a chevron on a plain trigger when asked, keeping its name', () => {
      render(
        <Collapsible>
          <Collapsible.Trigger indicator>Advanced options</Collapsible.Trigger>
          <Collapsible.Panel>the content</Collapsible.Panel>
        </Collapsible>,
      )

      const trigger = screen.getByRole('button', { name: 'Advanced options' })
      expect(trigger).not.toHaveAttribute('aria-labelledby')
      expect(
        screen.getByTestId('collapsible-trigger-indicator'),
      ).toBeInTheDocument()
    })

    it('keeps a plain trigger as it was: named by its content, no wrapper', () => {
      render(<Example />)

      const trigger = screen.getByRole('button', { name: 'Advanced options' })
      expect(trigger).not.toHaveAttribute('aria-labelledby')
      expect(trigger).not.toHaveAttribute('aria-describedby')
      expect(trigger.querySelector('.collapsible-trigger-body')).toBe(null)
    })

    it('renders a description alone, described by it only', () => {
      render(
        <Collapsible>
          <Collapsible.Trigger description="Second line">
            Title
          </Collapsible.Trigger>
        </Collapsible>,
      )

      const trigger = screen.getByRole('button', { name: 'Title' })
      expect(trigger).toHaveAccessibleDescription('Second line')
      expect(
        screen.queryByTestId('collapsible-trigger-right-section'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('collapsible-trigger-left-section'),
      ).not.toBeInTheDocument()
    })

    it('renders a right section alone, described by it', () => {
      render(
        <Collapsible>
          <Collapsible.Trigger rightSection="R$ 49,90">
            Title
          </Collapsible.Trigger>
        </Collapsible>,
      )

      const trigger = screen.getByRole('button', { name: 'Title' })
      expect(trigger).toHaveAccessibleDescription('R$ 49,90')
      expect(
        screen.queryByTestId('collapsible-trigger-description'),
      ).not.toBeInTheDocument()
    })

    it('keeps a left section out of the name and the description', () => {
      render(
        <Collapsible>
          <Collapsible.Trigger leftSection="icon">Title</Collapsible.Trigger>
        </Collapsible>,
      )

      const trigger = screen.getByRole('button', { name: 'Title' })
      expect(trigger).not.toHaveAttribute('aria-describedby')
      expect(
        screen.getByTestId('collapsible-trigger-left-section'),
      ).toHaveTextContent('icon')
    })

    it('refuses sections on an asChild trigger at the type level', () => {
      render(
        <Collapsible>
          {/* @ts-expect-error the child lays out its own content */}
          <Collapsible.Trigger asChild description="nope">
            <Button variant="ghost">More</Button>
          </Collapsible.Trigger>
        </Collapsible>,
      )

      // At runtime the child is rendered as it was given, nothing added.
      expect(
        screen.getByRole('button', { name: 'More' }),
      ).not.toHaveTextContent('nope')
    })
  })
})
