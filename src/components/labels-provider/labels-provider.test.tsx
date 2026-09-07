import { render, renderHook, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'

import { LabelsProvider } from './labels-provider'
import { defaultLabels } from './labels-provider.data'
import type { PartialTuryLabels } from './labels-provider.types'
import { useLabels } from './use-labels'

function wrapper(labels?: PartialTuryLabels) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <LabelsProvider labels={labels}>{children}</LabelsProvider>
  }
}

describe('useLabels', () => {
  it('falls back to the defaults with no provider, so a stray primitive still has words', () => {
    const { result } = renderHook(() => useLabels())

    expect(result.current.table.empty).toBe(defaultLabels.table.empty)
  })

  it('delivers an override', () => {
    const { result } = renderHook(() => useLabels(), {
      wrapper: wrapper({
        table: {
          empty: 'Nenhum registro encontrado',
        },
      }),
    })

    expect(result.current.table.empty).toBe('Nenhum registro encontrado')
  })

  it('keeps the strings the override does not mention', () => {
    const { result } = renderHook(() => useLabels(), {
      wrapper: wrapper({
        common: {
          clear: 'Limpar',
        },
      }),
    })

    expect(result.current.common.clear).toBe('Limpar')
    expect(result.current.common.cancel).toBe(defaultLabels.common.cancel)
    expect(result.current.list.empty).toBe(defaultLabels.list.empty)
  })

  it('lets a nested provider translate one region of a page', () => {
    function Probe() {
      return <span>{useLabels().common.cancel}</span>
    }

    render(
      <LabelsProvider>
        <Probe />
        <LabelsProvider
          labels={{
            common: {
              cancel: 'Cancelar',
            },
          }}
        >
          <Probe />
        </LabelsProvider>
      </LabelsProvider>,
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })
})
