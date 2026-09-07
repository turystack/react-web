import { describe, expect, it } from 'vitest'

import {
  applyMapping,
  guessMapping,
  issuesToCsv,
  parseCsv,
  templateCsv,
} from './data-transfer-import.utils'

const COLUMNS = [
  {
    example: 'TRY-1041',
    key: 'code' as const,
    label: 'Code',
  },
  {
    key: 'guestName' as const,
    label: 'Guest name',
  },
]

describe('parseCsv', () => {
  it('reads headers and rows', () => {
    const parsed = parseCsv('Code,Guest\nTRY-1041,Ada\nTRY-1042,Grace')

    expect(parsed.headers).toEqual(['Code', 'Guest'])
    expect(parsed.rows).toHaveLength(2)
  })

  it('keeps a comma that lives inside quotes', () => {
    expect(
      parseCsv('Code,Guest\nTRY-1041,"Lovelace, Ada"').rows[0]?.Guest,
    ).toBe('Lovelace, Ada')
  })

  it('reads a doubled quote as one quote', () => {
    expect(
      parseCsv('Code,Note\nTRY-1041,"she said ""yes"""').rows[0]?.Note,
    ).toBe('she said "yes"')
  })

  it('survives windows line endings and a trailing blank line', () => {
    expect(parseCsv('Code,Guest\r\nTRY-1041,Ada\r\n').rows).toHaveLength(1)
  })

  it('fills a short row rather than losing the column', () => {
    expect(parseCsv('Code,Guest\nTRY-1041').rows[0]).toEqual({
      Code: 'TRY-1041',
      Guest: '',
    })
  })
})

describe('guessMapping', () => {
  it('matches on the label, ignoring case, accents and punctuation', () => {
    expect(guessMapping(COLUMNS, ['código', 'GUEST NAME'])).toEqual({
      code: null,
      guestName: 'GUEST NAME',
    })
  })

  it('falls back to the key when the label does not match', () => {
    expect(guessMapping(COLUMNS, ['code'])).toEqual({
      code: 'code',
      guestName: null,
    })
  })

  it('never feeds two columns from one header', () => {
    expect(
      guessMapping(
        [
          {
            key: 'code' as const,
            label: 'Code',
          },
          {
            key: 'code2' as const,
            label: 'code',
          },
        ],
        ['Code'],
      ),
    ).toEqual({
      code: 'Code',
      code2: null,
    })
  })
})

describe('applyMapping', () => {
  it('rekeys the rows by column', () => {
    expect(
      applyMapping(
        [
          {
            Guest: 'Ada',
            Reference: 'TRY-1041',
          },
        ],
        {
          code: 'Reference',
          guestName: 'Guest',
        },
      ),
    ).toEqual([
      {
        code: 'TRY-1041',
        guestName: 'Ada',
      },
    ])
  })

  it('leaves an unmapped column empty rather than absent', () => {
    expect(
      applyMapping(
        [
          {
            Guest: 'Ada',
          },
        ],
        {
          code: null,
          guestName: 'Guest',
        },
      ),
    ).toEqual([
      {
        code: '',
        guestName: 'Ada',
      },
    ])
  })
})

describe('issuesToCsv', () => {
  it('gives the refused row back with its reason', () => {
    expect(
      issuesToCsv(
        [
          {
            code: 'TRY-1041',
          },
          {
            code: 'TRY-1042',
          },
        ],
        [
          {
            field: 'code',
            message: 'already exists',
            row: 2,
          },
        ],
      ),
    ).toBe('code,error\nTRY-1042,code: already exists')
  })

  it('quotes a reason that holds a comma', () => {
    expect(
      issuesToCsv(
        [
          {
            code: 'TRY-1041',
          },
        ],
        [
          {
            message: 'refused, twice',
            row: 1,
          },
        ],
      ),
    ).toContain('"refused, twice"')
  })
})

describe('templateCsv', () => {
  it('writes the headers, and the examples when there are any', () => {
    expect(templateCsv(COLUMNS)).toBe('Code,Guest name\nTRY-1041,')
  })

  it('writes headers alone when no column carries an example', () => {
    expect(
      templateCsv([
        {
          key: 'code' as const,
          label: 'Code',
        },
      ]),
    ).toBe('Code')
  })
})
