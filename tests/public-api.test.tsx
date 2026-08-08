import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import * as ReactWeb from '../src/index'

import {
  Brand,
  Button,
  OABusProvider,
  Select,
  Sidebar,
  TuryProvider,
} from '../src/index'

describe('@turystack/react-web public API', () => {
  it('keeps the provider compatibility alias', () => {
    expect(OABusProvider).toBe(TuryProvider)
  })

  it('does not expose application theme contracts', () => {
    expect(ReactWeb).not.toHaveProperty('Theme')
    expect(ReactWeb).not.toHaveProperty('ThemeProvider')
    expect(ReactWeb).not.toHaveProperty('ThemeContext')
    expect(ReactWeb).not.toHaveProperty('useTheme')
  })

  it('exports the core compatibility components', () => {
    expect(Button).toBeTypeOf('function')
    expect(Select).toBeTypeOf('function')
    expect(Sidebar).toBeTypeOf('function')
  })

  it('renders Brand without an application-specific asset', () => {
    const html = renderToStaticMarkup(<Brand title="TuryStack" />)

    expect(html).toContain('TuryStack')
    expect(html).toContain('>T</span>')
    expect(html).not.toContain('oabus')
  })
})
