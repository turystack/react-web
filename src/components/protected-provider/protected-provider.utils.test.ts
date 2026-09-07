import { describe, expect, it } from 'vitest'

import {
  canPerform,
  EVERYTHING,
  expandPermissions,
} from './protected-provider.utils'

describe('expandPermissions', () => {
  it('keeps a plain grant as itself', () => {
    expect([...expandPermissions(['user:read'])]).toEqual(['user:read'])
  })

  it('leaves a subject manage grant as itself, to be answered when asked', () => {
    const granted = expandPermissions(['user:manage'])

    expect([...granted]).toEqual(['user:manage'])
  })

  it('reads an organisation or workspace manager as holding everything', () => {
    expect(expandPermissions(['organization:manage']).has(EVERYTHING)).toBe(
      true,
    )
    expect(expandPermissions(['workspace:manage']).has(EVERYTHING)).toBe(true)
  })

  it('ignores an id with no action in it', () => {
    expect([...expandPermissions(['nonsense'])]).toEqual(['nonsense'])
  })

  it('holds nothing when the list is empty', () => {
    expect([...expandPermissions([])]).toEqual([])
  })
})

describe('canPerform', () => {
  const granted = expandPermissions(['user:read', 'booking:cancel'])

  it('asks for nothing and gets a yes', () => {
    expect(canPerform(granted, [])).toBe(true)
  })

  it('requires every id by default', () => {
    expect(canPerform(granted, ['user:read', 'booking:cancel'])).toBe(true)
    expect(canPerform(granted, ['user:read', 'user:delete'])).toBe(false)
  })

  it('takes any one of them when asked', () => {
    expect(canPerform(granted, ['user:delete', 'user:read'], 'any')).toBe(true)
    expect(canPerform(granted, ['user:delete'], 'any')).toBe(false)
  })

  /**
   * The catalogue used to answer this, and an app had to write one. The
   * subject is already in the id being asked about, so the grant can be
   * checked directly.
   */
  it('answers a subject manage grant for any action on that subject', () => {
    const manager = expandPermissions(['user:manage'])

    expect(canPerform(manager, ['user:delete'])).toBe(true)
    expect(canPerform(manager, ['user:create'])).toBe(true)
    expect(canPerform(manager, ['booking:cancel'])).toBe(false)
  })

  it('answers yes to everything for a manager', () => {
    expect(
      canPerform(expandPermissions(['organization:manage']), [
        'anything:at:all',
      ]),
    ).toBe(true)
  })

  it('holds nothing when no permission was given', () => {
    const none = expandPermissions([])

    expect(canPerform(none, ['user:read'])).toBe(false)
    expect(canPerform(none, [])).toBe(true)
  })
})
