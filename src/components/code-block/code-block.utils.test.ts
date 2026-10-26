import { describe, expect, it } from 'vitest'

import { printCodeValue, tokenizeJsonLine } from './code-block.utils'

describe('printCodeValue', () => {
  it('prints an object as JSON with two spaces', () => {
    expect(printCodeValue({ a: 1, b: [true] })).toBe(
      '{\n  "a": 1,\n  "b": [\n    true\n  ]\n}',
    )
  })

  it('passes a string through untouched', () => {
    expect(printCodeValue('{"a":1}')).toBe('{"a":1}')
  })

  it('falls back to the string form when the object cannot be printed', () => {
    const cyclic: Record<string, unknown> = {}

    cyclic.self = cyclic

    expect(printCodeValue(cyclic)).toBe('[object Object]')
  })
})

describe('tokenizeJsonLine', () => {
  it('names every kind of token on a line', () => {
    expect(
      tokenizeJsonLine('  "id": "evt_1", "n": -1.5e3, "ok": null,'),
    ).toEqual([
      { kind: 'plain', text: '  ' },
      { kind: 'key', text: '"id"' },
      { kind: 'punctuation', text: ':' },
      { kind: 'plain', text: ' ' },
      { kind: 'string', text: '"evt_1"' },
      { kind: 'punctuation', text: ',' },
      { kind: 'plain', text: ' ' },
      { kind: 'key', text: '"n"' },
      { kind: 'punctuation', text: ':' },
      { kind: 'plain', text: ' ' },
      { kind: 'number', text: '-1.5e3' },
      { kind: 'punctuation', text: ',' },
      { kind: 'plain', text: ' ' },
      { kind: 'key', text: '"ok"' },
      { kind: 'punctuation', text: ':' },
      { kind: 'plain', text: ' ' },
      { kind: 'literal', text: 'null' },
      { kind: 'punctuation', text: ',' },
    ])
  })

  it('keeps an escaped quote inside its string', () => {
    expect(tokenizeJsonLine('"say \\"hi\\""')).toEqual([
      { kind: 'string', text: '"say \\"hi\\""' },
    ])
  })

  it('does not colour digits or words that sit inside other text', () => {
    expect(tokenizeJsonLine('abc123 nullable')).toEqual([
      { kind: 'plain', text: 'abc123 nullable' },
    ])
  })

  it('gives back the line unchanged when the tokens are joined', () => {
    const line = '  garbage <b>"x":</b> 12 true ] {'

    expect(
      tokenizeJsonLine(line)
        .map((token) => token.text)
        .join(''),
    ).toBe(line)
  })

  it('returns nothing for an empty line', () => {
    expect(tokenizeJsonLine('')).toEqual([])
  })
})
