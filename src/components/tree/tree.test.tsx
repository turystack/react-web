import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Tree } from './tree'

type Folder = {
  children?: Folder[]
  id: string
  locked?: boolean
  name: string
}

const FOLDERS: Folder[] = [
  {
    children: [
      {
        id: 'brazil',
        name: 'Brazil',
      },
      {
        id: 'chile',
        locked: true,
        name: 'Chile',
      },
    ],
    id: 'south-america',
    name: 'South America',
  },
  {
    id: 'europe',
    name: 'Europe',
  },
]

function Folders(props: Partial<Parameters<typeof Tree<Folder>>[0]> = {}) {
  return (
    <Tree<Folder>
      ariaLabel="Destinations"
      itemChildren="children"
      itemKey="id"
      itemLabel="name"
      items={FOLDERS}
      {...props}
    />
  )
}

describe('Tree', () => {
  it('uses the real roles, not a styled list', () => {
    render(<Folders />)

    expect(
      screen.getByRole('tree', { name: 'Destinations' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('treeitem')).toHaveLength(2)
  })

  it('keeps a closed branch out of reach', () => {
    render(<Folders />)

    expect(screen.queryByText('Brazil')).not.toBeInTheDocument()
  })

  it('opens a branch on click and reports it', async () => {
    const onExpandedChange = vi.fn()

    render(<Folders onExpandedChange={onExpandedChange} />)

    await userEvent.click(screen.getByText('South America'))

    expect(screen.getByText('Brazil')).toBeInTheDocument()
    expect(onExpandedChange).toHaveBeenCalledWith(['south-america'])
  })

  it('starts open where it was told to', () => {
    render(<Folders defaultExpanded={['south-america']} />)

    expect(screen.getByText('Brazil')).toBeInTheDocument()
  })

  it('says what is expanded and what is selected', async () => {
    render(<Folders defaultExpanded={['south-america']} />)

    const [branchRow] = screen.getAllByRole('treeitem')

    expect(branchRow).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(screen.getByText('Brazil'))

    expect(
      screen
        .getAllByRole('treeitem')
        .find((row) => row.textContent === 'Brazil'),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('picks a leaf and hands back what was picked', async () => {
    const onSelect = vi.fn()

    render(<Folders defaultExpanded={['south-america']} onSelect={onSelect} />)

    await userEvent.click(screen.getByText('Brazil'))

    expect(onSelect).toHaveBeenCalledWith(
      'brazil',
      expect.objectContaining({
        id: 'brazil',
      }),
    )
  })

  it('opens and closes a branch from the keyboard', async () => {
    render(<Folders />)

    const [branchRow] = screen.getAllByRole('treeitem')

    branchRow?.focus()
    await userEvent.keyboard('{ArrowRight}')

    expect(screen.getByText('Brazil')).toBeInTheDocument()

    await userEvent.keyboard('{ArrowLeft}')

    expect(screen.queryByText('Brazil')).not.toBeInTheDocument()
  })

  it('walks the visible rows with the arrows', async () => {
    render(<Folders defaultExpanded={['south-america']} />)

    const [branchRow] = screen.getAllByRole('treeitem')

    branchRow?.focus()
    await userEvent.keyboard('{ArrowDown}')

    expect(document.activeElement).toHaveAttribute('data-key', 'brazil')
  })

  it('refuses a node its own data locked', async () => {
    const onSelect = vi.fn()

    render(
      <Folders
        defaultExpanded={['south-america']}
        itemDisabled="locked"
        onSelect={onSelect}
      />,
    )

    await userEvent.click(screen.getByText('Chile'))

    expect(onSelect).not.toHaveBeenCalled()
  })
})
