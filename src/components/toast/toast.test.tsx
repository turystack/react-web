import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TuryProvider } from '@/components/tury-provider'

import { Toast, toast } from './toast'

afterEach(() => {
  toast.dismiss()
})

describe('Toast', () => {
  it('renders the notification region', () => {
    render(<Toast />)

    expect(
      screen.getByRole('region', { name: /Notifications/ }),
    ).toBeInTheDocument()
  })

  it('shows the message handed to toast', async () => {
    render(<Toast />)

    toast('Saved')

    expect(await screen.findByText('Saved')).toBeInTheDocument()
  })

  it('shows the description beside the message', async () => {
    render(<Toast />)

    toast('Saved', {
      description: 'Your changes were saved.',
    })

    expect(await screen.findByText('Saved')).toBeInTheDocument()
    expect(
      await screen.findByText('Your changes were saved.'),
    ).toBeInTheDocument()
  })

  it('fires the action handed to the toast', async () => {
    const onAction = vi.fn()
    render(<Toast />)

    toast('Deleted', {
      action: {
        label: 'Undo',
        onClick: onAction,
      },
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }))

    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('dismisses the toast it was told to dismiss', async () => {
    render(<Toast />)

    const id = toast('Temporary')
    expect(await screen.findByText('Temporary')).toBeInTheDocument()

    toast.dismiss(id)

    await vi.waitFor(() => {
      expect(screen.queryByText('Temporary')).not.toBeInTheDocument()
    })
  })

  it('stacks one toast per message', async () => {
    render(<Toast />)

    toast('First')
    toast('Second')

    expect(await screen.findByText('First')).toBeInTheDocument()
    expect(await screen.findByText('Second')).toBeInTheDocument()
  })

  it('places the toaster at top-center unless another position is asked for', async () => {
    render(<Toast />)
    toast('Placed')
    await screen.findByText('Placed')

    const toaster = screen.getByRole('list')
    expect(toaster).toHaveAttribute('data-y-position', 'top')
    expect(toaster).toHaveAttribute('data-x-position', 'center')
  })

  it('places the toaster where the position prop asks', async () => {
    render(<Toast position="bottom-right" />)
    toast('Placed')
    await screen.findByText('Placed')

    const toaster = screen.getByRole('list')
    expect(toaster).toHaveAttribute('data-y-position', 'bottom')
    expect(toaster).toHaveAttribute('data-x-position', 'right')
  })

  it('follows the system theme unless another theme is asked for', async () => {
    render(<Toast />)
    toast('Themed')
    await screen.findByText('Themed')

    expect(screen.getByRole('list')).toHaveAttribute(
      'data-sonner-theme',
      'light',
    )
  })

  it('follows the theme it was given', async () => {
    render(<Toast theme="dark" />)
    toast('Themed')
    await screen.findByText('Themed')

    expect(screen.getByRole('list')).toHaveAttribute(
      'data-sonner-theme',
      'dark',
    )
  })
})

describe.each(['error', 'info', 'loading', 'success', 'warning'] as const)(
  'Toast %s',
  (variant) => {
    it('shows the message under its own type', async () => {
      render(<Toast />)

      toast[variant](`${variant} message`)

      await screen.findByText(`${variant} message`)

      expect(screen.getByRole('listitem')).toHaveAttribute('data-type', variant)
    })
  },
)

describe.each([
  'bottom-center',
  'bottom-left',
  'bottom-right',
  'top-center',
  'top-left',
  'top-right',
] as const)('Toast position %s', (position) => {
  it('keeps the notification region reachable', () => {
    render(<Toast position={position} />)

    expect(
      screen.getByRole('region', { name: /Notifications/ }),
    ).toBeInTheDocument()
  })
})

describe.each(['dark', 'light', 'system'] as const)(
  'Toast theme %s',
  (theme) => {
    it('keeps the notification region reachable', () => {
      render(<Toast theme={theme} />)

      expect(
        screen.getByRole('region', { name: /Notifications/ }),
      ).toBeInTheDocument()
    })
  },
)

describe('Toast portal container', () => {
  it('mounts inside the container the provider names', async () => {
    const container = document.createElement('div')
    document.body.append(container)

    render(<TuryProvider portalContainer={container} />)

    toast('Scoped')

    const message = await screen.findByText('Scoped')
    expect(container).toContainElement(message)

    container.remove()
  })

  it('resolves a container given as a function', async () => {
    const container = document.createElement('div')
    document.body.append(container)

    render(<TuryProvider portalContainer={() => container} />)

    toast('Lazy')

    expect(container).toContainElement(await screen.findByText('Lazy'))

    container.remove()
  })

  it('stays where it is mounted when no container is named', async () => {
    const { container: mounted } = render(<Toast />)

    toast('Default')

    const message = await screen.findByText('Default')
    expect(mounted).toContainElement(message)
  })
})
