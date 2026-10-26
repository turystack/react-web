import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LabelsProvider } from '@/components/labels-provider'

import { DescriptionList } from './description-list'
import type { DescriptionListItem } from './description-list.types'

const ITEMS: DescriptionListItem[] = [
  {
    label: 'Payment ID',
    value: 'pi_3N8x',
  },
  {
    label: 'Status',
    value: 'Succeeded',
  },
  {
    label: 'Amount',
    value: 1280,
  },
]

let writeText = vi.fn()

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined)

  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText,
    },
  })
})

describe('DescriptionList', () => {
  it('renders the pairs as a real description list', () => {
    const { container } = render(<DescriptionList items={ITEMS} />)

    const list = screen.getByTestId('description-list')

    expect(list.tagName).toBe('DL')
    expect(container.querySelectorAll('dl > div > dt')).toHaveLength(3)
    expect(container.querySelectorAll('dl > div > dd')).toHaveLength(3)
    expect(screen.getAllByRole('term')[0]).toHaveTextContent('Payment ID')
    expect(screen.getAllByRole('definition')[0]).toHaveTextContent('pi_3N8x')
  })

  it('stacks the label above the value by default', () => {
    render(<DescriptionList items={ITEMS} />)

    expect(screen.getByTestId('description-list')).toHaveAttribute(
      'data-layout',
      'stacked',
    )
    expect(
      screen.getAllByTestId('description-list-item')[0].className,
    ).toContain('flex-col')
  })

  it('puts label and value side by side when inline', () => {
    render(<DescriptionList items={ITEMS} layout="inline" />)

    const item = screen.getAllByTestId('description-list-item')[0]

    expect(screen.getByTestId('description-list')).toHaveAttribute(
      'data-layout',
      'inline',
    )
    expect(item.className).toContain('grid-cols-[minmax(0,2fr)_minmax(0,3fr)]')
    expect(item.className).not.toContain('flex-col')
  })

  it.each([
    [1, 'grid-cols-1', 'sm:grid-cols-2'],
    [2, 'sm:grid-cols-2', 'lg:grid-cols-3'],
    [3, 'lg:grid-cols-3', undefined],
  ] as const)(
    'lays the pairs out in %s column(s)',
    (columns, present, absent) => {
      render(
        <DescriptionList columns={columns} items={ITEMS} layout="inline" />,
      )

      const list = screen.getByTestId('description-list')

      expect(list).toHaveAttribute('data-columns', String(columns))
      expect(list.className).toContain(present)

      if (absent) {
        expect(list.className).not.toContain(absent)
      }
    },
  )

  it('draws rules between rows only when asked', () => {
    const { unmount } = render(<DescriptionList items={ITEMS} />)

    for (const item of screen.getAllByTestId('description-list-item')) {
      expect(item.className).not.toContain('border-t')
    }

    unmount()
    render(<DescriptionList columns={3} dividers items={ITEMS} />)

    const item = screen.getAllByTestId('description-list-item')[0]

    expect(item.className).toContain('border-t')
    expect(item.className).toContain('first:border-t-0')
    expect(item.className).toContain('sm:[&:nth-child(2)]:border-t-0')
    expect(item.className).toContain('lg:[&:nth-child(3)]:border-t-0')
  })

  it('suppresses only the first-row rules its column count has', () => {
    render(<DescriptionList dividers items={ITEMS} />)

    const item = screen.getAllByTestId('description-list-item')[0]

    expect(item.className).toContain('first:border-t-0')
    expect(item.className).not.toContain('nth-child')
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['false', false],
    ['an empty string', ''],
  ])('renders a muted em dash for %s', (_, value) => {
    render(
      <DescriptionList
        items={[
          {
            copyable: true,
            label: 'Customer',
            value,
          },
        ]}
      />,
    )

    const placeholder = screen.getByTestId('description-list-empty')

    expect(placeholder).toHaveTextContent('—')
    expect(placeholder.className).toContain('text-muted-foreground')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders zero as a value, not as empty', () => {
    render(<DescriptionList items={[{ label: 'Refunds', value: 0 }]} />)

    expect(screen.getByRole('definition')).toHaveTextContent('0')
    expect(
      screen.queryByTestId('description-list-empty'),
    ).not.toBeInTheDocument()
  })

  it('copies a string value itself when copyable is true', async () => {
    render(
      <DescriptionList
        items={[
          {
            copyable: true,
            label: 'Payment ID',
            value: 'pi_3N8x',
          },
          {
            label: 'Status',
            value: 'Succeeded',
          },
        ]}
      />,
    )

    const [withCopy, withoutCopy] = screen.getAllByRole('definition')

    expect(within(withoutCopy).queryByRole('button')).not.toBeInTheDocument()

    await userEvent.click(
      within(withCopy).getByRole('button', { name: 'Copy Payment ID' }),
    )

    expect(writeText).toHaveBeenCalledWith('pi_3N8x')
    expect(within(withCopy).getByRole('status')).toHaveTextContent('Copied')
  })

  it('copies a number value as its text', async () => {
    render(
      <DescriptionList
        items={[{ copyable: true, label: 'Amount', value: 1280 }]}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Copy Amount' }))

    expect(writeText).toHaveBeenCalledWith('1280')
  })

  it('copies the given string instead of what is shown', async () => {
    render(
      <DescriptionList
        items={[
          {
            copyable: 'jenny@example.com',
            label: 'Customer',
            value: <a href="/customers/1">Jenny Rosen</a>,
          },
        ]}
      />,
    )

    expect(screen.getByRole('link')).toHaveTextContent('Jenny Rosen')

    await userEvent.click(screen.getByRole('button', { name: 'Copy Customer' }))

    expect(writeText).toHaveBeenCalledWith('jenny@example.com')
  })

  it('names every copy button after its own item', () => {
    render(
      <DescriptionList
        items={[
          { copyable: true, label: 'Payment ID', value: 'pi_3N8x' },
          { copyable: true, label: 'Customer ID', value: 'cus_9' },
          { copyable: true, label: 'Amount', value: 1280 },
        ]}
      />,
    )

    expect(
      screen
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Copy Payment ID', 'Copy Customer ID', 'Copy Amount'])
  })

  it('keeps the plain copy name when the label is a node or empty', () => {
    render(
      <DescriptionList
        items={[
          { copyable: true, label: <strong>Payment ID</strong>, value: 'pi_1' },
          { copyable: true, label: '', value: 'pi_2' },
        ]}
      />,
    )

    expect(screen.getAllByRole('button', { name: 'Copy' })).toHaveLength(2)
  })

  it('takes the copy name from the labels provider', () => {
    render(
      <LabelsProvider
        labels={{ common: { copyValue: (label) => `Copiar ${label}` } }}
      >
        <DescriptionList
          items={[{ copyable: true, label: 'ID do pagamento', value: 'pi_1' }]}
        />
      </LabelsProvider>,
    )

    expect(
      screen.getByRole('button', { name: 'Copiar ID do pagamento' }),
    ).toBeInTheDocument()
  })

  it('adds no copy when true meets a value that is a node', () => {
    render(
      <DescriptionList
        items={[
          {
            copyable: true,
            label: 'Customer',
            value: <a href="/customers/1">Jenny Rosen</a>,
          },
        ]}
      />,
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('adds no copy for copyable false or an empty string', () => {
    render(
      <DescriptionList
        items={[
          {
            copyable: false,
            label: 'A',
            value: 'a',
          },
          {
            copyable: '',
            label: 'B',
            value: 'b',
          },
        ]}
      />,
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders nothing but the list when there are no items', () => {
    render(<DescriptionList items={[]} />)

    expect(screen.getByTestId('description-list')).toBeEmptyDOMElement()
  })

  it('carries its slot classes', () => {
    render(<DescriptionList items={ITEMS.slice(0, 1)} />)

    expect(screen.getByTestId('description-list').className).toContain(
      'description-list',
    )
    expect(screen.getByTestId('description-list-item').className).toContain(
      'description-list-item',
    )
    expect(screen.getByTestId('description-list-label').className).toContain(
      'description-list-label',
    )
    expect(screen.getByTestId('description-list-value').className).toContain(
      'description-list-value',
    )
  })
})
