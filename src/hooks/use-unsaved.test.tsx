import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { type UnsavedOptions, useUnsaved } from './use-unsaved'

function Screen(options: UnsavedOptions) {
  const [leave, UnsavedDialog] = useUnsaved(options)

  return (
    <>
      <button onClick={leave} type="button">
        Leave
      </button>
      {UnsavedDialog()}
    </>
  )
}

const dialogTitle = 'Leave without saving?'

describe('useUnsaved', () => {
  it('keeps the dialog closed until the guard is triggered', () => {
    render(<Screen leaving unsaved />)

    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument()
  })

  it('asks before leaving with unsaved changes', async () => {
    const onProceed = vi.fn()
    render(<Screen leaving onProceed={onProceed} unsaved />)

    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))

    expect(await screen.findByText(dialogTitle)).toBeInTheDocument()
    expect(onProceed).not.toHaveBeenCalled()
  })

  it('leaves straight away when nothing is unsaved', async () => {
    const onProceed = vi.fn()
    render(<Screen leaving onProceed={onProceed} unsaved={false} />)

    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))

    expect(onProceed).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument()
  })

  it('leaves straight away when the user is not leaving', async () => {
    const onProceed = vi.fn()
    render(<Screen leaving={false} onProceed={onProceed} unsaved />)

    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))

    expect(onProceed).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument()
  })

  it('survives having no onProceed to call', async () => {
    render(<Screen leaving={false} unsaved />)

    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))

    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument()
  })

  it('proceeds and closes when the user confirms', async () => {
    const onProceed = vi.fn()
    render(<Screen leaving onProceed={onProceed} unsaved />)

    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))
    await screen.findByText(dialogTitle)

    await userEvent.click(
      screen.getByRole('button', { name: 'Leave without saving' }),
    )

    expect(onProceed).toHaveBeenCalledTimes(1)
    await vi.waitFor(() => {
      expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument()
    })
  })

  it('stays put when the user goes back to editing', async () => {
    const onProceed = vi.fn()
    render(<Screen leaving onProceed={onProceed} unsaved />)

    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))
    await screen.findByText(dialogTitle)

    await userEvent.click(screen.getByRole('button', { name: 'Keep editing' }))

    expect(onProceed).not.toHaveBeenCalled()
    await vi.waitFor(() => {
      expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument()
    })
  })

  it('lets the caller replace the confirm copy', async () => {
    render(
      <Screen
        confirm={{
          confirmText: 'Descartar',
          description: 'O rascunho será perdido.',
          title: 'Descartar rascunho?',
        }}
        leaving
        unsaved
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))

    expect(await screen.findByText('Descartar rascunho?')).toBeInTheDocument()
    expect(screen.getByText('O rascunho será perdido.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Descartar' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(dialogTitle)).not.toBeInTheDocument()
  })
})

describe('useUnsaved labels', () => {
  it('takes the whole dialog copy from the provider', async () => {
    render(
      <TuryProvider
        labels={{
          unsaved: {
            cancel: 'Continuar editando',
            confirm: 'Sair sem salvar',
            description: 'Você tem alterações não salvas.',
            title: 'Deseja sair sem salvar?',
          },
        }}
      >
        <Screen leaving unsaved />
      </TuryProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Leave' }))

    expect(
      await screen.findByText('Deseja sair sem salvar?'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Você tem alterações não salvas.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Sair sem salvar' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Continuar editando' }),
    ).toBeInTheDocument()
  })
})
