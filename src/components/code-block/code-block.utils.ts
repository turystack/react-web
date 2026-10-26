import type { CodeBlockValue } from './code-block.types'

/** What a piece of JSON is, which decides its colour. */
export type JsonTokenKind =
  | 'key'
  | 'string'
  | 'number'
  | 'literal'
  | 'punctuation'
  | 'plain'

export type JsonToken = {
  kind: JsonTokenKind
  text: string
}

/**
 * The text the block shows and the copy control copies. An object is printed
 * as JSON with two spaces; one JSON cannot print (a cycle, a BigInt) falls
 * back to its string form rather than taking the screen down with it.
 */
export function printCodeValue(value: CodeBlockValue): string {
  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  } catch {
    return String(value)
  }
}

/**
 * One alternative per token kind, tried left to right. A string is a key when
 * the next non-blank character is a colon — decided after the match.
 */
const JSON_TOKEN =
  /("(?:\\.|[^"\\])*"?)|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|\b(true|false|null)\b|([{}[\],:])/g

/**
 * Splits one line of JSON into coloured runs. It is a lexer, not a parser:
 * text that is not valid JSON still comes back whole, just less coloured,
 * and joining every token's text gives the line back unchanged.
 */
export function tokenizeJsonLine(line: string): JsonToken[] {
  const tokens: JsonToken[] = []
  let cursor = 0

  for (const match of line.matchAll(JSON_TOKEN)) {
    const start = match.index
    const [text, string, number, literal] = match

    if (start > cursor) {
      tokens.push({ kind: 'plain', text: line.slice(cursor, start) })
    }

    let kind: JsonTokenKind = 'punctuation'

    if (string !== undefined) {
      kind = /^\s*:/.test(line.slice(start + text.length)) ? 'key' : 'string'
    } else if (number !== undefined) {
      kind = 'number'
    } else if (literal !== undefined) {
      kind = 'literal'
    }

    tokens.push({ kind, text })
    cursor = start + text.length
  }

  if (cursor < line.length) {
    tokens.push({ kind: 'plain', text: line.slice(cursor) })
  }

  return tokens
}
