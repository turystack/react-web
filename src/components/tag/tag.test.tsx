import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Badge, type BadgeVariant } from '@/components/badge'
import { LabelsProvider } from '@/components/labels-provider'

import { Tag } from './tag'
import type { TagSize } from './tag.types'

describe('Tag', () => {
  it('renders its text inside a badge', () => {
    render(<Tag>BEMVINDO10</Tag>)

    expect(screen.getByTestId('tag')).toHaveTextContent('BEMVINDO10')
    expect(screen.getByTestId('badge')).toHaveTextContent('BEMVINDO10')
  })

  it('offers no × and takes no focus without onRemove', async () => {
    render(<Tag>BEMVINDO10</Tag>)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    await userEvent.tab()

    expect(document.body).toHaveFocus()
  })

  it('names the × after the tag and fires onRemove on click', async () => {
    const onRemove = vi.fn()
    render(<Tag onRemove={onRemove}>BEMVINDO10</Tag>)

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove BEMVINDO10' }),
    )

    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('removes from the keyboard with Enter and Space', async () => {
    const onRemove = vi.fn()
    render(<Tag onRemove={onRemove}>Pix</Tag>)

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Remove Pix' })).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')

    expect(onRemove).toHaveBeenCalledTimes(2)
  })

  it('names the × after a number child', () => {
    render(<Tag onRemove={() => {}}>{2026}</Tag>)

    expect(
      screen.getByRole('button', { name: 'Remove 2026' }),
    ).toBeInTheDocument()
  })

  it('names the × from label when the children are rich', () => {
    render(
      <Tag label="São Paulo" onRemove={() => {}}>
        <strong>São Paulo</strong>
      </Tag>,
    )

    expect(
      screen.getByRole('button', { name: 'Remove São Paulo' }),
    ).toBeInTheDocument()
  })

  it('lets label override the name of a text tag', () => {
    render(
      <Tag label="coupon BEMVINDO10" onRemove={() => {}}>
        BEMVINDO10
      </Tag>,
    )

    expect(
      screen.getByRole('button', { name: 'Remove coupon BEMVINDO10' }),
    ).toBeInTheDocument()
  })

  it('refuses rich children without a label at the type level', () => {
    // @ts-expect-error — the × needs a string name, rich children do not give one.
    render(<Tag onRemove={() => {}}>{<strong>São Paulo</strong>}</Tag>)

    expect(screen.getByTestId('tag')).toHaveTextContent('São Paulo')
  })

  it('takes the × name from the labels provider', () => {
    render(
      <LabelsProvider labels={{ tag: { remove: (label) => `Tirar ${label}` } }}>
        <Tag onRemove={() => {}}>Pix</Tag>
      </LabelsProvider>,
    )

    expect(
      screen.getByRole('button', { name: 'Tirar Pix' }),
    ).toBeInTheDocument()
  })

  it('renders the icon before the text, hidden from assistive technology', () => {
    render(<Tag icon={<svg data-testid="pin" />}>São Paulo</Tag>)

    const icon = screen.getByTestId('pin')
    expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true')
    expect(
      icon.parentElement?.compareDocumentPosition(
        screen.getByText('São Paulo'),
      ),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('renders no icon slot without an icon', () => {
    const { container } = render(<Tag>Pix</Tag>)

    expect(container.querySelector('.tag-icon')).toBeNull()
  })
})

describe('Tag disabled', () => {
  it('blocks the × and marks the tag', async () => {
    const onRemove = vi.fn()
    render(
      <Tag disabled onRemove={onRemove}>
        Pix
      </Tag>,
    )

    const remove = screen.getByRole('button', { name: 'Remove Pix' })
    expect(remove).toBeDisabled()
    expect(screen.getByTestId('tag')).toHaveAttribute('data-disabled', 'true')

    await userEvent.click(remove)

    expect(onRemove).not.toHaveBeenCalled()
  })

  it('stays enabled by default', () => {
    render(<Tag onRemove={() => {}}>Pix</Tag>)

    expect(screen.getByRole('button', { name: 'Remove Pix' })).toBeEnabled()
    expect(screen.getByTestId('tag')).not.toHaveAttribute('data-disabled')
  })
})

describe('Tag focus after removal', () => {
  function Tags({ initial }: { initial: string[] }) {
    const [tags, setTags] = useState(initial)

    return (
      <div>
        {tags.map((tag) => (
          <Tag
            key={tag}
            onRemove={() =>
              setTags((current) => current.filter((t) => t !== tag))
            }
          >
            {tag}
          </Tag>
        ))}
      </div>
    )
  }

  it('hands focus to the next tag’s ×', async () => {
    render(<Tags initial={['Pix', 'Card', 'Boleto']} />)

    await userEvent.click(screen.getByRole('button', { name: 'Remove Card' }))

    expect(screen.queryByText('Card')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Boleto' })).toHaveFocus()
  })

  it('hands focus to the previous tag’s × when it was the last', async () => {
    render(<Tags initial={['Pix', 'Card']} />)

    await userEvent.click(screen.getByRole('button', { name: 'Remove Card' }))

    expect(screen.getByRole('button', { name: 'Remove Pix' })).toHaveFocus()
  })

  it('skips a disabled neighbour', async () => {
    render(
      <div>
        <Tag onRemove={() => {}}>Pix</Tag>
        <Tag onRemove={() => {}}>Card</Tag>
        <Tag disabled onRemove={() => {}}>
          Boleto
        </Tag>
      </div>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Remove Card' }))

    expect(screen.getByRole('button', { name: 'Remove Pix' })).toHaveFocus()
  })
})

describe.each(['sm', 'md'] as TagSize[])('Tag size %s', (size) => {
  it('maps onto the matching badge size', () => {
    render(
      <Tag onRemove={() => {}} size={size}>
        Pix
      </Tag>,
    )

    expect(screen.getByTestId('tag')).toHaveAttribute('data-size', size)
    expect(screen.getByTestId('badge')).toHaveAttribute(
      'data-size',
      size === 'sm' ? 'md' : 'lg',
    )
    expect(screen.getByTestId('tag-remove').className).toContain(
      size === 'sm' ? 'size-4' : 'size-5',
    )
  })
})

describe('Tag defaults', () => {
  it('is md and secondary when nothing is given', () => {
    render(<Tag>Pix</Tag>)

    expect(screen.getByTestId('tag')).toHaveAttribute('data-size', 'md')
    expect(screen.getByTestId('tag')).toHaveAttribute(
      'data-variant',
      'secondary',
    )
    expect(screen.getByTestId('badge')).toHaveAttribute('data-size', 'lg')
    render(
      <Badge size="lg" variant="secondary">
        Pix
      </Badge>,
    )
    const [inTag, alone] = screen.getAllByTestId('badge')
    expect(inTag?.className).toBe(alone?.className)
  })
})

describe.each([
  'default',
  'secondary',
  'destructive',
  'outline',
  'success',
  'warning',
  'info',
  'solid',
  'solid-destructive',
  'solid-success',
  'solid-info',
  'purple',
  'pink',
  'teal',
  'orange',
] as BadgeVariant[])('Tag variant %s', (variant) => {
  it('paints exactly like the badge variant of the same name', () => {
    render(
      <>
        <Tag variant={variant}>Pix</Tag>
        <Badge size="lg" variant={variant}>
          Pix
        </Badge>
      </>,
    )

    const [inTag, alone] = screen.getAllByTestId('badge')
    expect(screen.getByTestId('tag')).toHaveAttribute('data-variant', variant)
    expect(inTag?.className).toBe(alone?.className)
  })
})

describe('Tag disabledReason', () => {
  const reason = 'Applied by your plan'

  it('renders no wrapper and no description without a reason', () => {
    render(<Tag onRemove={() => {}}>PLANO10</Tag>)

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby')
    expect(
      document.querySelector('[data-slot="disabled-reason"]'),
    ).not.toBeInTheDocument()
  })

  it('blocks the × but keeps it in the tab order', async () => {
    const onRemove = vi.fn()

    render(
      <Tag disabledReason={reason} onRemove={onRemove}>
        PLANO10
      </Tag>,
    )
    const remove = screen.getByRole('button', { name: 'Remove PLANO10' })

    expect(remove).toHaveAttribute('aria-disabled', 'true')
    expect(remove).not.toHaveAttribute('disabled')
    expect(screen.getByTestId('tag')).toHaveAttribute('data-disabled', 'true')

    await userEvent.tab()
    expect(remove).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await userEvent.click(remove, { pointerEventsCheck: 0 })

    expect(onRemove).not.toHaveBeenCalled()
  })

  it('describes the × with the reason and shows it on keyboard focus', async () => {
    render(
      <Tag disabledReason={reason} onRemove={() => {}}>
        PLANO10
      </Tag>,
    )

    expect(screen.getByRole('button')).toHaveAccessibleDescription(reason)

    await userEvent.tab()
    expect(
      await screen.findByTestId('disabled-reason-popup'),
    ).toHaveTextContent(reason)
  })
})

describe('Tag disabledReason, edge cases', () => {
  it('keeps focus when a reason arrives on the focused ×', async () => {
    const reason = 'Required by the template'
    const tag = (blocked: boolean) => (
      <Tag disabledReason={blocked ? reason : undefined} onRemove={() => {}}>
        Design
      </Tag>
    )
    const { rerender } = render(tag(false))
    await userEvent.tab()
    const remove = () => screen.getByTestId('tag-remove')
    expect(remove()).toHaveFocus()

    rerender(tag(true))

    expect(remove()).toHaveFocus()
    expect(remove()).toHaveAccessibleDescription(reason)
  })
})
