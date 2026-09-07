import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Card } from './card'

describe('Card', () => {
  it('renders every section it was given', () => {
    render(
      <Card>
        <Card.Header bordered>
          <Card.Title>Pro plan</Card.Title>
          <Card.Description>Billed monthly</Card.Description>
        </Card.Header>
        <Card.Content>Everything included</Card.Content>
        <Card.Separator />
        <Card.Footer bordered>Upgrade</Card.Footer>
      </Card>,
    )

    expect(screen.getByText('Pro plan')).toBeInTheDocument()
    expect(screen.getByText('Billed monthly')).toBeInTheDocument()
    expect(screen.getByText('Everything included')).toBeInTheDocument()
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('renders an unbordered header and footer just as well', () => {
    render(
      <Card>
        <Card.Header>Pro plan</Card.Header>
        <Card.Footer>Upgrade</Card.Footer>
      </Card>,
    )

    expect(screen.getByText('Pro plan')).toBeInTheDocument()
    expect(screen.getByText('Upgrade')).toBeInTheDocument()
  })

  it('fires onClick from anywhere inside the card', async () => {
    const onClick = vi.fn()
    render(
      <Card onClick={onClick}>
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )

    await userEvent.click(screen.getByText('Everything included'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('stays inert when no onClick was given', async () => {
    render(
      <Card>
        <Card.Content>Everything included</Card.Content>
      </Card>,
    )

    await userEvent.click(screen.getByText('Everything included'))

    expect(screen.getByText('Everything included')).toBeInTheDocument()
  })

  it('keeps a button inside the card reachable on its own', async () => {
    const onClick = vi.fn()
    const onCardClick = vi.fn()
    render(
      <Card onClick={onCardClick}>
        <Card.Footer>
          <button onClick={onClick} type="button">
            Upgrade
          </button>
        </Card.Footer>
      </Card>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Upgrade' }))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onCardClick).toHaveBeenCalledTimes(1)
  })
})

describe.each(['sm', 'md', 'lg', 'xl'] as const)(
  'Card minHeight %s',
  (minHeight) => {
    it('keeps its content readable', () => {
      render(
        <Card minHeight={minHeight}>
          <Card.Content>Everything included</Card.Content>
        </Card>,
      )

      expect(screen.getByText('Everything included')).toBeInTheDocument()
    })
  },
)

describe.each(['start', 'center'] as const)(
  'Card verticalAlign %s',
  (verticalAlign) => {
    it('keeps its content readable', () => {
      render(
        <Card verticalAlign={verticalAlign}>
          <Card.Content>Everything included</Card.Content>
        </Card>,
      )

      expect(screen.getByText('Everything included')).toBeInTheDocument()
    })
  },
)
