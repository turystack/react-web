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

    expect(on.className).toContain('text-green-600')
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
