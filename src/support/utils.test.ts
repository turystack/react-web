import { describe, expect, it } from 'vitest'

import { cn, tv } from './utils'

describe('cn', () => {
  it('joins the class names it is given', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('keeps the last of two conflicting utilities', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('drops the falsy entries', () => {
    expect(cn('px-2', false, null, undefined, '')).toBe('px-2')
  })

  it('takes the truthy side of a conditional map', () => {
    expect(
      cn('px-2', {
        'text-red-500': true,
        'text-slate-500': false,
      }),
    ).toBe('px-2 text-red-500')
  })

  it('flattens nested arrays', () => {
    expect(cn(['px-2', ['py-1', 'gap-2']])).toBe('px-2 py-1 gap-2')
  })

  it('returns an empty string when given nothing', () => {
    expect(cn()).toBe('')
  })
})

describe('tv', () => {
  it('resolves the base of a variant set', () => {
    const button = tv({
      base: 'inline-flex',
    })

    expect(button()).toContain('inline-flex')
  })

  it('applies the variant asked for over the default', () => {
    const button = tv({
      base: 'inline-flex',
      defaultVariants: {
        size: 'md',
      },
      variants: {
        size: {
          md: 'h-9',
          sm: 'h-8',
        },
      },
    })

    expect(button()).toContain('h-9')
    expect(
      button({
        size: 'sm',
      }),
    ).toContain('h-8')
  })
})
