import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { InputSize, InputVariant } from '@/components/input/input.types'

import { TagsInput } from './tags-input'

function field() {
  return screen.getByRole('textbox')
}

function tagTexts() {
  return screen.queryAllByTestId('badge').map((tag) => tag.textContent)
}

describe('TagsInput', () => {
  it('delivers the whole list when a tag is added', async () => {
    const onChange = vi.fn()
    render(<TagsInput onChange={onChange} />)

    await userEvent.type(field(), 'react{Enter}')

    expect(onChange).toHaveBeenLastCalledWith(['react'])

    await userEvent.type(field(), 'vue{Enter}')

    expect(onChange).toHaveBeenLastCalledWith(['react', 'vue'])
  })

  it('trims the tag it stores', async () => {
    const onChange = vi.fn()
    render(<TagsInput onChange={onChange} />)

    await userEvent.type(field(), '  react  {Enter}')

    expect(onChange).toHaveBeenLastCalledWith(['react'])
  })

  it('adds nothing for a blank entry', async () => {
    const onChange = vi.fn()
    render(<TagsInput onChange={onChange} />)

    await userEvent.type(field(), '   {Enter}')

    expect(onChange).not.toHaveBeenCalled()
    expect(tagTexts()).toEqual([])
  })

  it('refuses a duplicate tag by default', async () => {
    const onChange = vi.fn()
    render(<TagsInput defaultValue={['react']} onChange={onChange} />)

    await userEvent.type(field(), 'react{Enter}')

    expect(onChange).not.toHaveBeenCalled()
    expect(tagTexts()).toEqual(['react'])
  })

  it('keeps a duplicate tag when duplicates are allowed', async () => {
    const onChange = vi.fn()
    render(
      <TagsInput
        allowDuplicates
        defaultValue={['react']}
        onChange={onChange}
      />,
    )

    await userEvent.type(field(), 'react{Enter}')

    expect(onChange).toHaveBeenLastCalledWith(['react', 'react'])
  })

  it('stops accepting tags once maxTags is reached', async () => {
    const onChange = vi.fn()
    render(<TagsInput maxTags={2} onChange={onChange} />)

    await userEvent.type(field(), 'a{Enter}b{Enter}c{Enter}')

    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'])
    expect(tagTexts()).toEqual(['a', 'b'])
  })

  it('removes the last tag on backspace in an empty field', async () => {
    const onChange = vi.fn()
    render(<TagsInput defaultValue={['react', 'vue']} onChange={onChange} />)

    await userEvent.type(field(), '{Backspace}')

    expect(onChange).toHaveBeenLastCalledWith(['react'])
    expect(tagTexts()).toEqual(['react'])
  })

  it('leaves the tags alone on backspace while the field has text', async () => {
    const onChange = vi.fn()
    render(<TagsInput defaultValue={['react']} onChange={onChange} />)

    await userEvent.type(field(), 'vu{Backspace}')

    expect(onChange).not.toHaveBeenCalled()
    expect(tagTexts()).toEqual(['react'])
  })

  it('does nothing on backspace when there is no tag left', async () => {
    const onChange = vi.fn()
    render(<TagsInput onChange={onChange} />)

    await userEvent.type(field(), '{Backspace}')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('removes the tag that was clicked', async () => {
    const onChange = vi.fn()
    render(
      <TagsInput
        defaultValue={['react', 'vue', 'svelte']}
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getAllByTestId('badge')[1])

    expect(onChange).toHaveBeenLastCalledWith(['react', 'svelte'])
    expect(tagTexts()).toEqual(['react', 'svelte'])
  })

  it('starts from defaultValue and changes on its own', async () => {
    render(<TagsInput defaultValue={['react']} />)

    expect(tagTexts()).toEqual(['react'])

    await userEvent.type(field(), 'vue{Enter}')

    expect(tagTexts()).toEqual(['react', 'vue'])
  })

  it('reports the next list but holds its own when controlled', async () => {
    const onChange = vi.fn()
    render(<TagsInput onChange={onChange} value={['react']} />)

    await userEvent.type(field(), 'vue{Enter}')

    expect(onChange).toHaveBeenLastCalledWith(['react', 'vue'])
    expect(tagTexts()).toEqual(['react'])
  })

  it('shows the placeholder only while it has no tag', async () => {
    render(<TagsInput placeholder="Add a tag" />)

    expect(screen.getByPlaceholderText('Add a tag')).toBeInTheDocument()

    await userEvent.type(field(), 'react{Enter}')

    expect(screen.queryByPlaceholderText('Add a tag')).not.toBeInTheDocument()
  })

  it('blocks typing while disabled', async () => {
    const onChange = vi.fn()
    render(<TagsInput disabled onChange={onChange} />)

    expect(field()).toBeDisabled()

    await userEvent.type(field(), 'react{Enter}')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('hands focus to the field when the container is clicked', async () => {
    render(<TagsInput defaultValue={['react']} />)

    await userEvent.click(screen.getByTestId('tags-input-root'))

    expect(field()).toHaveFocus()
  })

  it('carries the native input attributes it is given', () => {
    render(<TagsInput aria-label="Topics" name="topics" />)

    expect(screen.getByRole('textbox', { name: 'Topics' })).toHaveAttribute(
      'name',
      'topics',
    )
  })

  it('says which entry was refused as a duplicate', async () => {
    const onReject = vi.fn()
    render(<TagsInput defaultValue={['react']} onReject={onReject} />)

    await userEvent.type(field(), 'react{Enter}')

    expect(onReject).toHaveBeenCalledWith('react', 'duplicate')
  })

  it('says which entry was refused for passing maxTags', async () => {
    const onReject = vi.fn()
    render(<TagsInput maxTags={1} onReject={onReject} />)

    await userEvent.type(field(), 'a{Enter}b{Enter}')

    expect(onReject).toHaveBeenCalledWith('b', 'max-tags')
  })

  it('stays quiet while the entries are being taken', async () => {
    const onReject = vi.fn()
    render(<TagsInput maxTags={2} onReject={onReject} />)

    await userEvent.type(field(), 'a{Enter}   {Enter}b{Enter}')

    expect(onReject).not.toHaveBeenCalled()
  })

  it('leaves a refused entry in the field', async () => {
    render(<TagsInput defaultValue={['react']} />)

    await userEvent.type(field(), 'react{Enter}')

    expect(field()).toHaveValue('react')
  })

  it('renders the section content on each side of the tags', () => {
    render(
      <TagsInput leftSection={<span>#</span>} rightSection={<span>go</span>} />,
    )

    expect(screen.getByTestId('tags-input-section-left')).toHaveTextContent('#')
    expect(screen.getByTestId('tags-input-section-right')).toHaveTextContent(
      'go',
    )
  })

  it('accepts a custom width for each section', () => {
    render(
      <TagsInput
        leftSection={<span>#</span>}
        leftSectionWidth={48}
        rightSection={<span>go</span>}
        rightSectionWidth={64}
      />,
    )

    expect(screen.getByTestId('tags-input-section-left')).toHaveStyle({
      width: '48px',
    })
    expect(screen.getByTestId('tags-input-section-right')).toHaveStyle({
      width: '64px',
    })
  })

  it('keeps the section nodes off the native input', () => {
    render(
      <TagsInput leftSection={<span>#</span>} rightSection={<span>go</span>} />,
    )

    expect(field()).not.toHaveAttribute('leftsection')
    expect(field()).not.toHaveAttribute('rightsection')
  })

  it('blocks typing while loading and takes over the right section', async () => {
    const onChange = vi.fn()
    render(
      <TagsInput
        loading
        onChange={onChange}
        rightSection={<span>clear</span>}
      />,
    )

    expect(field()).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('clear')).not.toBeInTheDocument()
    expect(field()).toBeDisabled()

    await userEvent.type(field(), 'react{Enter}')

    expect(onChange).not.toHaveBeenCalled()
  })
})

describe.each(['sm', 'md', 'lg'] as InputSize[])(
  'TagsInput size %s',
  (size) => {
    it('still accepts a tag', async () => {
      render(<TagsInput size={size} />)

      await userEvent.type(field(), 'react{Enter}')

      expect(tagTexts()).toEqual(['react'])
    })
  },
)

describe.each(['default', 'ghost'] as InputVariant[])(
  'TagsInput variant %s',
  (variant) => {
    it('still accepts a tag', async () => {
      render(<TagsInput variant={variant} />)

      await userEvent.type(field(), 'react{Enter}')

      expect(tagTexts()).toEqual(['react'])
    })
  },
)
