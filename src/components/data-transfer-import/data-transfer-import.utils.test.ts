import { describe, expect, it, vi } from 'vitest'

import {
  acceptOf,
  applyMapping,
  decodeBytes,
  detectDelimiter,
  detectEncoding,
  formatOfFile,
  guessMapping,
  PREVIEW_BYTES,
  PREVIEW_ROWS,
  PreviewUnreadableError,
  parseCsv,
  previewFromBytes,
  readPreview,
  templateCsv,
} from './data-transfer-import.utils'

const utf8 = (text: string) => new TextEncoder().encode(text)

/** Latin-1 bytes for text whose characters all sit below 0x100. */
const latin1 = (text: string) =>
  Uint8Array.from(text, (character) => character.charCodeAt(0))

function utf16le(text: string) {
  const bytes = new Uint8Array(2 + text.length * 2)

  bytes[0] = 0xff
  bytes[1] = 0xfe

  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index)

    bytes[2 + index * 2] = code & 0xff
    bytes[3 + index * 2] = code >> 8
  }

  return bytes
}

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

describe('formatOfFile', () => {
  it.each([
    ['bookings.csv', '', 'csv'],
    ['bookings.JSON', '', 'json'],
    ['bookings.jsonl', '', 'jsonl'],
    ['bookings.ndjson', '', 'jsonl'],
    ['bookings', 'text/csv', 'csv'],
    ['bookings', 'application/x-ndjson', 'jsonl'],
  ])('reads %s (%s) as %s', (name, type, format) => {
    expect(
      formatOfFile({
        name,
        type,
      }),
    ).toBe(format)
  })

  it('knows no format for a spreadsheet', () => {
    expect(
      formatOfFile({
        name: 'bookings.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    ).toBeNull()
  })
})

describe('acceptOf', () => {
  it('lists the extensions of the formats offered, JSONL under both names', () => {
    expect(acceptOf(['csv', 'jsonl'])).toBe('.csv,.jsonl,.ndjson')
  })
})

describe('detectEncoding', () => {
  it('names UTF-8 by its BOM', () => {
    expect(detectEncoding(Uint8Array.from([0xef, 0xbb, 0xbf, 0x41]))).toEqual({
      bomLength: 3,
      encoding: 'utf-8',
    })
  })

  it('names UTF-16LE by its BOM', () => {
    expect(detectEncoding(utf16le('A'))).toEqual({
      bomLength: 2,
      encoding: 'utf-16le',
    })
  })

  it('refuses UTF-16BE, as the worker does', () => {
    expect(() =>
      detectEncoding(Uint8Array.from([0xfe, 0xff, 0, 0x41])),
    ).toThrow(PreviewUnreadableError)
  })

  it('takes bytes that decode as UTF-8 for UTF-8', () => {
    expect(detectEncoding(utf8('Joao,São Paulo')).encoding).toBe('utf-8')
  })

  it('takes a UTF-8 character cut at the 64 KB edge for UTF-8 still', () => {
    // `ã` is 0xC3 0xA3; the head ends after its first byte.
    expect(detectEncoding(utf8('São').subarray(0, 2)).encoding).toBe('utf-8')
  })

  it('takes anything else for Windows-1252, a spreadsheet saved as CSV', () => {
    expect(detectEncoding(latin1('São Paulo')).encoding).toBe('windows-1252')
  })
})

describe('decodeBytes', () => {
  it('maps the Windows-1252 bytes Latin-1 gets wrong', () => {
    expect(
      decodeBytes(Uint8Array.from([0x80, 0x20, 0x93, 0x94]), 'windows-1252'),
    ).toBe('€ \u201c\u201d')
  })
})

describe('detectDelimiter', () => {
  it.each([
    ['nome;email;empresa', ';'],
    ['nome\temail\tempresa', '\t'],
    ['nome|email|empresa', '|'],
    ['nome,email,empresa', ','],
    ['nome', ','],
  ])('reads %j as delimited by %j', (header, delimiter) => {
    expect(detectDelimiter(`${header}\nrow`)).toBe(delimiter)
  })

  it('counts only the header row, outside quotes', () => {
    expect(detectDelimiter('"a;b";c,d,e\nx;y;z;w;v')).toBe(',')
  })
})

describe('parseCsv', () => {
  it('reads records by the delimiter it is given', () => {
    expect(parseCsv('Code;Guest\nTRY-1041;Ada', ';')).toEqual([
      ['Code', 'Guest'],
      ['TRY-1041', 'Ada'],
    ])
  })

  it('keeps a delimiter and a line break that live inside quotes', () => {
    expect(parseCsv('Code,Guest\nTRY-1041,"Lovelace,\nAda"')[1]).toEqual([
      'TRY-1041',
      'Lovelace,\nAda',
    ])
  })

  it('reads a doubled quote as one quote', () => {
    expect(parseCsv('Code,Note\nTRY-1041,"she said ""yes"""')[1]?.[1]).toBe(
      'she said "yes"',
    )
  })

  it('survives windows line endings and skips a blank line', () => {
    expect(parseCsv('Code,Guest\r\n\r\nTRY-1041,Ada\r\n')).toHaveLength(2)
  })

  it('keeps a line of empty fields as a row, as the worker does', () => {
    expect(parseCsv('a,b\n,\n1,2')).toEqual([
      ['a', 'b'],
      ['', ''],
      ['1', '2'],
    ])
  })

  it('reads a quote inside an unquoted field as a quote (relax_quotes)', () => {
    expect(parseCsv('name,size\nTV,55" screen\nRadio,small')).toEqual([
      ['name', 'size'],
      ['TV', '55" screen'],
      ['Radio', 'small'],
    ])
  })

  it('trims nothing: the worker reads " email" as " email"', () => {
    expect(parseCsv('name, email\nAda, a@b')[0]).toEqual(['name', ' email'])
  })
})

describe('previewFromBytes', () => {
  it('reads the roadmap’s file: semicolons, headers and rows', () => {
    expect(
      previewFromBytes(
        utf8(
          'nome;email;empresa\nRafael;rafael@northwind.example;Northwind\nAna;ana@;Acme',
        ),
        'csv',
        true,
      ),
    ).toEqual({
      delimiter: ';',
      encoding: 'utf-8',
      headers: ['nome', 'email', 'empresa'],
      row_numbers: [1, 2],
      rows: [
        {
          email: 'rafael@northwind.example',
          empresa: 'Northwind',
          nome: 'Rafael',
        },
        {
          email: 'ana@',
          empresa: 'Acme',
          nome: 'Ana',
        },
      ],
    })
  })

  it('drops the BOM, so the first header is not "\ufeffnome"', () => {
    const bytes = new Uint8Array([
      0xef,
      0xbb,
      0xbf,
      ...utf8('nome,email\nAna,a@b'),
    ])

    expect(previewFromBytes(bytes, 'csv', true).headers).toEqual([
      'nome',
      'email',
    ])
  })

  it('reads a UTF-16LE file', () => {
    const preview = previewFromBytes(
      utf16le('nome,cidade\nJoão,São Paulo'),
      'csv',
      true,
    )

    expect(preview.encoding).toBe('utf-16le')
    expect(preview.rows[0]).toEqual({
      cidade: 'São Paulo',
      nome: 'João',
    })
  })

  it('reads a Windows-1252 file', () => {
    const preview = previewFromBytes(
      latin1('nome,cidade\nJoão,São Paulo'),
      'csv',
      true,
    )

    expect(preview.encoding).toBe('windows-1252')
    expect(preview.rows[0]?.cidade).toBe('São Paulo')
  })

  it('drops the last row of a head cut mid-file, which may be cut too', () => {
    const preview = previewFromBytes(
      utf8('Code,Guest\nTRY-1,Ada\nTRY-2,Gra'),
      'csv',
      false,
    )

    expect(preview.rows).toEqual([
      {
        Code: 'TRY-1',
        Guest: 'Ada',
      },
    ])
  })

  it('keeps the last row of a file read whole', () => {
    expect(
      previewFromBytes(utf8('Code,Guest\nTRY-1,Ada\nTRY-2,Grace'), 'csv', true)
        .rows,
    ).toHaveLength(2)
  })

  it(`keeps no more than ${PREVIEW_ROWS} rows`, () => {
    const lines = Array.from({ length: 30 }, (_, index) => `TRY-${index},x`)

    expect(
      previewFromBytes(utf8(['Code,Guest', ...lines].join('\n')), 'csv', true)
        .rows,
    ).toHaveLength(PREVIEW_ROWS)
  })

  it('fills a short row rather than losing the column', () => {
    expect(
      previewFromBytes(utf8('Code,Guest\nTRY-1041'), 'csv', true).rows[0],
    ).toEqual({
      Code: 'TRY-1041',
      Guest: '',
    })
  })

  it('leaves out an empty header, a trailing delimiter', () => {
    expect(
      previewFromBytes(utf8('Code,Guest,\nTRY-1,Ada,x'), 'csv', true),
    ).toMatchObject({
      headers: ['Code', 'Guest'],
      rows: [
        {
          Code: 'TRY-1',
          Guest: 'Ada',
        },
      ],
    })
  })

  it('refuses a header named twice, which the worker fails the file for', () => {
    expect(() =>
      previewFromBytes(utf8('Code,Guest,Code\nTRY-1,Ada,TRY-9'), 'csv', true),
    ).toThrow(
      expect.objectContaining({
        detail: 'Code',
        problem: 'duplicate_header',
      }),
    )
  })

  it('keeps a header as written, so the mapping names what the worker reads', () => {
    expect(
      previewFromBytes(utf8('name, email\nAda, a@b'), 'csv', true),
    ).toMatchObject({
      headers: ['name', ' email'],
      rows: [
        {
          ' email': ' a@b',
          name: 'Ada',
        },
      ],
    })
  })

  it('still maps a CSV whose first row is longer than the head', () => {
    const preview = previewFromBytes(
      utf8(`Code,Note\nTRY-1,${'x'.repeat(200)}`),
      'csv',
      false,
    )

    expect(preview.headers).toEqual(['Code', 'Note'])
    expect(preview.rows).toEqual([])
  })

  it('refuses a head with a header and no row under it', () => {
    expect(() => previewFromBytes(utf8('Code,Guest\n'), 'csv', true)).toThrow(
      PreviewUnreadableError,
    )
  })

  it('reads a JSON array, headers in the order they first appear', () => {
    expect(
      previewFromBytes(
        utf8(
          '[{"code":"TRY-1","nights":3},{"code":"TRY-2","guest":null,"vip":true}]',
        ),
        'json',
        true,
      ),
    ).toEqual({
      encoding: 'utf-8',
      headers: ['code', 'nights', 'guest', 'vip'],
      row_numbers: [1, 2],
      rows: [
        {
          code: 'TRY-1',
          guest: '',
          nights: '3',
          vip: '',
        },
        {
          code: 'TRY-2',
          guest: '',
          nights: '',
          vip: 'true',
        },
      ],
    })
  })

  it('reads the whole elements of a JSON array cut mid-element', () => {
    const preview = previewFromBytes(
      utf8(
        '[ {"code":"TRY-1","tags":["a","b]"]}, {"code":"TRY-2"}, {"code":"TR',
      ),
      'json',
      false,
    )

    expect(preview.rows).toEqual([
      {
        code: 'TRY-1',
        tags: '["a","b]"]',
      },
      {
        code: 'TRY-2',
        tags: '',
      },
    ])
  })

  it('skips a JSON element that is not an object, keeping the worker’s numbers', () => {
    const preview = previewFromBytes(
      utf8('[1, {"code":"TRY-1"}]'),
      'json',
      true,
    )

    expect(preview.rows).toEqual([
      {
        code: 'TRY-1',
      },
    ])
    // The worker records element 1 as `invalid_row`; this one is its row 2.
    expect(preview.row_numbers).toEqual([2])
  })

  it('refuses JSON that is not an array, by name', () => {
    expect(() => previewFromBytes(utf8('"x"'), 'json', true)).toThrow(
      expect.objectContaining({
        problem: 'not_an_array',
      }),
    )
  })

  it('refuses JSON that is not an array', () => {
    expect(() =>
      previewFromBytes(utf8('{"code":"TRY-1"}'), 'json', true),
    ).toThrow(PreviewUnreadableError)
  })

  it('reads JSONL line by line, skipping blank and broken lines', () => {
    expect(
      previewFromBytes(
        utf8('{"code":"TRY-1"}\n\nnot json\n{"code":"TRY-2","guest":"Ada"}\n'),
        'jsonl',
        true,
      ).rows,
    ).toEqual([
      {
        code: 'TRY-1',
        guest: '',
      },
      {
        code: 'TRY-2',
        guest: 'Ada',
      },
    ])
  })

  it('numbers JSONL rows as the worker does: a broken line counts, a blank one not', () => {
    expect(
      previewFromBytes(
        utf8('{"code":"TRY-1"}\n\nnot json\n{"code":"TRY-2"}\n'),
        'jsonl',
        true,
      ).row_numbers,
    ).toEqual([1, 3])
  })

  it('drops the last JSONL line of a head cut mid-file', () => {
    expect(
      previewFromBytes(
        utf8('{"code":"TRY-1"}\n{"code":"TRY-2"}'),
        'jsonl',
        false,
      ).rows,
    ).toEqual([
      {
        code: 'TRY-1',
      },
    ])
  })

  it('refuses a UTF-16 JSON file, which JSON never is', () => {
    expect(() => previewFromBytes(utf16le('[{"a":1}]'), 'json', true)).toThrow(
      PreviewUnreadableError,
    )
  })
})

describe('readPreview', () => {
  it('reads only the head of the file, through File.slice', async () => {
    const body = `Code,Guest\n${'TRY-1,Ada\n'.repeat(20_000)}`
    const file = new File([body], 'big.csv', {
      type: 'text/csv',
    })
    const slice = vi.spyOn(file, 'slice')

    const preview = await readPreview(file, 'csv')

    expect(file.size).toBeGreaterThan(PREVIEW_BYTES)
    expect(slice).toHaveBeenCalledWith(0, PREVIEW_BYTES)
    expect(preview.rows).toHaveLength(PREVIEW_ROWS)
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

  it('leaves an unmapped column out, as the worker never reads it', () => {
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
        guestName: 'Ada',
      },
    ])
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
