import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Avatar } from './avatar'

// jsdom fetches nothing, so the headless avatar's `new window.Image()` never
// settles and the image slot stays in its loading state forever. Standing in a
// decoded image is the only way the loaded branch of the contract is reachable.
function stubDecodedImage(naturalWidth: number) {
  vi.stubGlobal(
    'Image',
    class {
      complete = true
      naturalWidth = naturalWidth
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      crossOrigin: string | null = null
      src = ''
    },
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Avatar', () => {
  it('shows the fallback content when it has no image to show', () => {
    render(<Avatar>AS</Avatar>)

    expect(screen.getByText('AS')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the image under its alt text once the image decodes', () => {
    stubDecodedImage(64)
    render(
      <Avatar alt="Ana Silva" src="/ana.png">
        AS
      </Avatar>,
    )

    expect(screen.getByRole('img', { name: 'Ana Silva' })).toHaveAttribute(
      'src',
      '/ana.png',
    )
  })

  it('falls back to the children when the image fails to decode', () => {
    stubDecodedImage(0)
    render(
      <Avatar alt="Ana Silva" src="/broken.png">
        AS
      </Avatar>,
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('keeps the fallback reachable while the image is still loading', () => {
    render(
      <Avatar alt="Ana Silva" src="/ana.png">
        AS
      </Avatar>,
    )

    expect(screen.getByText('AS')).toBeInTheDocument()
  })
})

describe.each(['sm', 'md', 'lg'] as const)('Avatar size %s', (size) => {
  it('still shows its fallback content', () => {
    render(<Avatar size={size}>AS</Avatar>)

    expect(screen.getByText('AS')).toBeInTheDocument()
  })
})

describe.each(['circle', 'square'] as const)('Avatar variant %s', (variant) => {
  it('still shows its fallback content', () => {
    render(<Avatar variant={variant}>AS</Avatar>)

    expect(screen.getByText('AS')).toBeInTheDocument()
  })
})

describe('Avatar.Group', () => {
  it('stacks the avatars it is given', () => {
    render(
      <Avatar.Group>
        <Avatar alt="Ada">A</Avatar>
        <Avatar alt="Grace">G</Avatar>
      </Avatar.Group>,
    )

    expect(screen.getAllByTestId('avatar-root')).toHaveLength(2)
    expect(screen.queryByTestId('avatar-group-count')).not.toBeInTheDocument()
  })

  it('turns the overflow into a number instead of a crowd', () => {
    render(
      <Avatar.Group max={2}>
        <Avatar alt="Ada">A</Avatar>
        <Avatar alt="Grace">G</Avatar>
        <Avatar alt="Alan">T</Avatar>
        <Avatar alt="Edsger">E</Avatar>
      </Avatar.Group>,
    )

    expect(screen.getAllByTestId('avatar-root')).toHaveLength(2)
    expect(screen.getByTestId('avatar-group-count')).toHaveTextContent('+2')
  })

  it('sizes the counter like the avatars beside it', () => {
    render(
      <Avatar.Group max={1} size="sm">
        <Avatar alt="Ada">A</Avatar>
        <Avatar alt="Grace">G</Avatar>
      </Avatar.Group>,
    )

    expect(screen.getByTestId('avatar-group-count').className).toContain(
      'size-7',
    )
  })
})
