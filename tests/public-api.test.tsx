import { describe, expect, it } from 'vitest'
import * as ReactWeb from '../src/index'

import { Button, Layout, Select } from '../src/index'

describe('@turystack/react-web public API', () => {
  it('does not expose application theme contracts', () => {
    expect(ReactWeb).not.toHaveProperty('Theme')
    expect(ReactWeb).not.toHaveProperty('ThemeProvider')
    expect(ReactWeb).not.toHaveProperty('ThemeContext')
    expect(ReactWeb).not.toHaveProperty('useTheme')
  })

  it('exports the core compatibility components', () => {
    expect(Button).toBeTypeOf('function')
    expect(Select).toBeTypeOf('function')
    expect(Layout.Sidebar).toBeTypeOf('function')
  })

  it('no longer exposes the retired names', () => {
    expect(ReactWeb).not.toHaveProperty('OABusProvider')
    expect(ReactWeb).not.toHaveProperty('Brand')
    expect(ReactWeb).not.toHaveProperty('SelectSheet')
  })
})
