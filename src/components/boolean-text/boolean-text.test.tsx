import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LabelsProvider } from '@/components/labels-provider'

import { BooleanText } from './boolean-text'

describe('BooleanText', () => {
  it('says yes and no by default', () => {
    render(
      <>
        <BooleanText value={true} />
        <BooleanText value={false} />
      </>,
    )

    const [yes, no] = screen.getAllByTestId('boolean-text')

    expect(yes).toHaveTextContent('Yes')
    expect(no).toHaveTextContent('No')
  })

  it('speaks the wording each variant is for', () => {
    render(
      <>
        <BooleanText value={true} variant="activeInactive" />
        <BooleanText value={false} variant="enabledDisabled" />
      </>,
    )

    const [active, disabled] = screen.getAllByTestId('boolean-text')

    expect(active).toHaveTextContent('Active')
    expect(disabled).toHaveTextContent('Disabled')
  })

  it('keeps the word beside the tick, for a reader who cannot see it', () => {
    render(<BooleanText value={true} variant="check" />)

    expect(screen.getByTestId('boolean-text')).toHaveTextContent('Yes')
  })

  it('keeps the tick inline so a centred cell centres it', () => {
    render(
      <>
        <BooleanText value={true} variant="check" />
        <BooleanText value={false} variant="check" />
      </>,
    )

    for (const flag of screen.getAllByTestId('boolean-text')) {
      const box = flag.querySelector('.boolean-text-check')

      expect(box).toHaveClass('inline-flex', 'items-center')
      expect(box?.querySelector('svg')).toBeInTheDocument()
      expect(box).toHaveTextContent(/Yes|No/)
    }
  })

  it('draws no icon box for the word variants', () => {
    render(<BooleanText value={true} />)

    const flag = screen.getByTestId('boolean-text')

    expect(flag.querySelector('.boolean-text-check')).toBeNull()
    expect(flag.querySelector('svg')).toBeNull()
  })

  it('translates with the labels', () => {
    render(
      <LabelsProvider
        labels={{
          booleanText: {
            no: 'Não',
            yes: 'Sim',
          },
        }}
      >
        <BooleanText value={true} />
      </LabelsProvider>,
    )

    expect(screen.getByTestId('boolean-text')).toHaveTextContent('Sim')
  })

  it('paints the flag by its state only when asked', () => {
    render(
      <>
        <BooleanText colored value={true} />
        <BooleanText colored value={false} />
        <BooleanText value={false} />
      </>,
    )

    const [on, off, plain] = screen.getAllByTestId('boolean-text')

    expect(on.className).toContain('text-success')
    expect(off.className).toContain('text-destructive')
    expect(plain.className).not.toContain('text-destructive')
  })

  it('does not read an absent flag as false', () => {
    render(
      <>
        <BooleanText value={null} />
        <BooleanText fallback="unknown" value={undefined} />
      </>,
    )

    const [empty, custom] = screen.getAllByTestId('boolean-text')

    expect(empty).toHaveTextContent('—')
    expect(empty).not.toHaveTextContent('No')
    expect(custom).toHaveTextContent('unknown')
  })
})

describe('BooleanText axes', () => {
  it('publishes its default variant for a theme to select', () => {
    render(<BooleanText value={true} />)

    expect(
      screen.getByTestId('boolean-text').closest('.formatter-text'),
    ).toHaveAttribute('data-variant', 'yesNo')
  })

  it('publishes the variant it was given, the fallback included', () => {
    render(
      <>
        <BooleanText value={true} variant="check" />
        <BooleanText value={null} variant="activeInactive" />
      </>,
    )

    const [check, empty] = screen
      .getAllByTestId('boolean-text')
      .map((value) => value.closest('.formatter-text'))
    expect(check).toHaveAttribute('data-variant', 'check')
    expect(empty).toHaveAttribute('data-variant', 'activeInactive')
  })
})
