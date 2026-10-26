import { describe, expect, it } from 'vitest'

import {
  alignmentPositions,
  byteCapacity,
  chooseVersion,
  dataCodewordsFor,
  encodeQr,
  encodeQrBytes,
  formatBits,
  functionModules,
  gfMultiply,
  maskApplies,
  penaltyScore,
  type QrMatrix,
  rawDataModules,
  reedSolomonDivisor,
  reedSolomonRemainder,
  versionBits,
} from './qr-code.encoder'
import type { QrCodeLevel } from './qr-code.types'

const LEVELS: QrCodeLevel[] = ['L', 'M', 'Q', 'H']

const bytesOf = (value: string) => Array.from(new TextEncoder().encode(value))

/** A Pix "copia e cola" payload (static key, 137 bytes). */
const PIX =
  '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D'

/** Reads the first copy of the format information back out of a symbol. */
function readFormatNearTopLeft({ modules }: QrMatrix): number {
  const at = (column: number, row: number) => (modules[row]?.[column] ? 1 : 0)
  let bits = 0

  for (let index = 0; index <= 5; index++) {
    bits |= at(8, index) << index
  }
  bits |= at(8, 7) << 6
  bits |= at(8, 8) << 7
  bits |= at(7, 8) << 8
  for (let index = 9; index < 15; index++) {
    bits |= at(14 - index, 8) << index
  }

  return bits
}

/** Reads the second copy, split between the top-right and bottom-left finders. */
function readFormatSplit({ modules, size }: QrMatrix): number {
  const at = (column: number, row: number) => (modules[row]?.[column] ? 1 : 0)
  let bits = 0

  for (let index = 0; index < 8; index++) {
    bits |= at(size - 1 - index, 8) << index
  }
  for (let index = 8; index < 15; index++) {
    bits |= at(8, size - 15 + index) << index
  }

  return bits
}

function readVersion({ modules, size }: QrMatrix, transposed: boolean) {
  let bits = 0

  for (let index = 0; index < 18; index++) {
    const near = size - 11 + (index % 3)
    const far = Math.floor(index / 3)
    const dark = transposed ? modules[near]?.[far] : modules[far]?.[near]
    bits |= (dark ? 1 : 0) << index
  }

  return bits
}

/** The 7×7 finder: dark ring, light ring, dark 3×3 core. */
function finderAt({ modules }: QrMatrix, left: number, top: number) {
  const rows: string[] = []

  for (let row = 0; row < 7; row++) {
    let line = ''

    for (let column = 0; column < 7; column++) {
      line += modules[top + row]?.[left + column] ? '#' : '.'
    }
    rows.push(line)
  }

  return rows
}

const FINDER = [
  '#######',
  '#.....#',
  '#.###.#',
  '#.###.#',
  '#.###.#',
  '#.....#',
  '#######',
]

function asArt({ modules }: QrMatrix): string[] {
  return modules.map((row) => row.map((dark) => (dark ? '#' : '.')).join(''))
}

function asHex({ modules, size }: QrMatrix): string[] {
  return modules.map((row) =>
    BigInt(`0b${row.map((dark) => (dark ? '1' : '0')).join('')}`)
      .toString(16)
      .padStart(Math.ceil(size / 4), '0'),
  )
}

describe('QR capacity', () => {
  it('counts the raw data modules of the smallest and largest symbols', () => {
    expect(rawDataModules(1)).toBe(208)
    expect(rawDataModules(40)).toBe(29648)
  })

  it.each([
    [1, [17, 14, 11, 7]],
    [2, [32, 26, 20, 14]],
    [10, [271, 213, 151, 119]],
    [40, [2953, 2331, 1663, 1273]],
  ] as const)(
    'holds the ISO byte-mode capacities for version %i (L, M, Q, H)',
    (version, capacities) => {
      expect(LEVELS.map((level) => byteCapacity(version, level))).toEqual(
        capacities,
      )
    },
  )

  it('picks the smallest version that fits, and steps up one byte later', () => {
    expect(chooseVersion(14, 'M')).toBe(1)
    expect(chooseVersion(15, 'M')).toBe(2)
    expect(chooseVersion(213, 'M')).toBe(10)
    expect(chooseVersion(214, 'M')).toBe(11)
  })

  it('refuses a payload no version can hold', () => {
    expect(chooseVersion(2331, 'M')).toBe(40)
    expect(() => chooseVersion(2332, 'M')).toThrow(RangeError)
    expect(() => encodeQr('x'.repeat(1274), { level: 'H' })).toThrow(
      /do not fit version 40/,
    )
  })

  it('needs a larger symbol for the same payload at a higher level', () => {
    const versions = LEVELS.map((level) => encodeQr(PIX, { level }).version)

    expect(versions).toEqual([...versions].sort((a, b) => a - b))
    expect(versions[0]).toBeLessThan(versions[3] ?? 0)
  })
})

describe('QR alignment patterns', () => {
  it.each([
    [1, []],
    [2, [6, 18]],
    [7, [6, 22, 38]],
    [14, [6, 26, 46, 66]],
    [32, [6, 34, 60, 86, 112, 138]],
    [40, [6, 30, 58, 86, 114, 142, 170]],
  ] as const)(
    'places version %i at the ISO table positions',
    (version, positions) => {
      expect(alignmentPositions(version)).toEqual(positions)
    },
  )
})

describe('QR BCH codes', () => {
  it.each([
    [
      'L',
      '111011111000100 111001011110011 111110110101010 111100010011101 110011000101111 110001100011000 110110001000001 110100101110110',
    ],
    [
      'M',
      '101010000010010 101000100100101 101111001111100 101101101001011 100010111111001 100000011001110 100111110010111 100101010100000',
    ],
    [
      'Q',
      '011010101011111 011000001101000 011111100110001 011101000000110 010010010110100 010000110000011 010111011011010 010101111101101',
    ],
    [
      'H',
      '001011010001001 001001110111110 001110011100111 001100111010000 000011101100010 000001001010101 000110100001100 000100000111011',
    ],
  ] as const)(
    'matches the ISO format information table at level %s',
    (level, table) => {
      const bits = [0, 1, 2, 3, 4, 5, 6, 7].map((mask) =>
        formatBits(level, mask).toString(2).padStart(15, '0'),
      )

      expect(bits.join(' ')).toBe(table)
    },
  )

  it.each([
    [7, 0x07c94],
    [8, 0x085bc],
    [21, 0x15683],
    [40, 0x28c69],
  ])('matches the ISO version information for version %i', (version, bits) => {
    expect(versionBits(version)).toBe(bits)
  })
})

describe('QR Reed–Solomon', () => {
  it('multiplies in GF(256) reduced by 0x11D', () => {
    expect(gfMultiply(0x53, 1)).toBe(0x53)
    expect(gfMultiply(0x53, 0)).toBe(0)
    expect(gfMultiply(0x80, 2)).toBe(0x1d)
    expect(gfMultiply(0x57, 0x13)).toBe(gfMultiply(0x13, 0x57))
  })

  it('reproduces the ISO/IEC 18004 annex I example (1-M, "01234567")', () => {
    const data = [
      0x10, 0x20, 0x0c, 0x56, 0x61, 0x80, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11,
      0xec, 0x11, 0xec, 0x11,
    ]

    expect(reedSolomonRemainder(data, reedSolomonDivisor(10))).toEqual([
      0xa5, 0x24, 0xd4, 0xc1, 0xed, 0x36, 0xc7, 0x87, 0x2c, 0x55,
    ])
  })

  it('reproduces the "HELLO WORLD" 1-M error correction codewords', () => {
    const data = [
      32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17,
    ]

    expect(reedSolomonRemainder(data, reedSolomonDivisor(10))).toEqual([
      196, 35, 39, 119, 235, 215, 231, 226, 93, 23,
    ])
  })
})

describe('QR data codewords', () => {
  it('writes byte mode, the count, the bytes, a terminator and the pad bytes', () => {
    expect(dataCodewordsFor(bytesOf('HELLO WORLD'), 1, 'M')).toEqual([
      0x40, 0xb4, 0x84, 0x54, 0xc4, 0xc4, 0xf2, 0x05, 0x74, 0xf5, 0x24, 0xc4,
      0x40, 0xec, 0x11, 0xec,
    ])
  })

  it('counts UTF-8 bytes, not characters', () => {
    const [mode = 0, count = 0] = dataCodewordsFor(bytesOf('ç'), 1, 'L')

    expect(bytesOf('ç')).toHaveLength(2)
    expect(((mode & 0x0f) << 4) | (count >>> 4)).toBe(2)
  })
})

describe('QR masks', () => {
  it('rejects a mask outside 0–7', () => {
    expect(() => maskApplies(8, 0, 0)).toThrow(RangeError)
    expect(() => encodeQr('a', { mask: 9 })).toThrow(RangeError)
  })

  it('keeps a forced mask and writes it into the format information', () => {
    for (let mask = 0; mask < 8; mask++) {
      const symbol = encodeQr('turystack', { level: 'Q', mask })

      expect(symbol.mask).toBe(mask)
      expect(readFormatNearTopLeft(symbol)).toBe(formatBits('Q', mask))
    }
  })

  it('chooses the mask with the lowest penalty score', () => {
    for (const value of ['a', 'HELLO WORLD', PIX]) {
      const chosen = encodeQr(value)
      const scores = [0, 1, 2, 3, 4, 5, 6, 7].map((mask) =>
        penaltyScore(encodeQr(value, { mask }).modules),
      )

      expect(penaltyScore(chosen.modules)).toBe(Math.min(...scores))
      expect(scores.indexOf(Math.min(...scores))).toBe(chosen.mask)
    }
  })

  it('penalises a flat symbol far more than a balanced one', () => {
    const flat = Array.from({ length: 21 }, () =>
      new Array<boolean>(21).fill(false),
    )

    expect(penaltyScore(flat)).toBeGreaterThan(
      penaltyScore(encodeQr('HELLO WORLD').modules),
    )
  })
})

describe('QR structure, every version', () => {
  it.each(Array.from({ length: 40 }, (_, index) => index + 1))(
    'version %i carries finders, timing, dark module, format and version info',
    (version) => {
      const level: QrCodeLevel = LEVELS[version % 4] ?? 'M'
      const bytes = new Array<number>(byteCapacity(version, level)).fill(0x61)
      const symbol = encodeQrBytes(bytes, { level })
      const { modules, size } = symbol

      expect(symbol.version).toBe(version)
      expect(size).toBe(version * 4 + 17)
      expect(modules).toHaveLength(size)
      expect(modules.every((row) => row.length === size)).toBe(true)

      expect(finderAt(symbol, 0, 0)).toEqual(FINDER)
      expect(finderAt(symbol, size - 7, 0)).toEqual(FINDER)
      expect(finderAt(symbol, 0, size - 7)).toEqual(FINDER)

      // Separators: the light border just inside each finder's outer edge.
      for (let index = 0; index < 8; index++) {
        expect(modules[7]?.[index]).toBe(false)
        expect(modules[index]?.[7]).toBe(false)
        expect(modules[7]?.[size - 1 - index]).toBe(false)
        expect(modules[size - 8]?.[index]).toBe(false)
      }

      for (let index = 8; index < size - 8; index++) {
        expect(modules[6]?.[index]).toBe(index % 2 === 0)
        expect(modules[index]?.[6]).toBe(index % 2 === 0)
      }

      expect(modules[size - 8]?.[8]).toBe(true)

      const format = formatBits(level, symbol.mask)
      expect(readFormatNearTopLeft(symbol)).toBe(format)
      expect(readFormatSplit(symbol)).toBe(format)

      if (version >= 7) {
        expect(readVersion(symbol, false)).toBe(versionBits(version))
        expect(readVersion(symbol, true)).toBe(versionBits(version))
      }

      // Every alignment pattern that does not collide with a finder has a dark centre
      // inside a light ring.
      const positions = alignmentPositions(version)
      for (const row of positions) {
        for (const column of positions) {
          const onFinder =
            (row < 9 && column < 9) ||
            (row < 9 && column > size - 9) ||
            (row > size - 9 && column < 9)

          if (!onFinder) {
            expect(modules[row]?.[column]).toBe(true)
            expect(modules[row - 1]?.[column]).toBe(false)
            expect(modules[row - 2]?.[column]).toBe(true)
          }
        }
      }
    },
  )

  it('leaves exactly the raw data modules free for data', () => {
    for (const version of [1, 6, 7, 20, 40]) {
      const reserved = functionModules(version)
      const free = reserved.flat().filter((isFunction) => !isFunction).length

      expect(free).toBe(rawDataModules(version))
    }
  })
})

describe('QR reference symbols', () => {
  // Both matrices were produced by an independent encoder (Project Nayuki's
  // qrcodegen, MIT) with the same inputs, level M, automatic mask and no
  // error-correction boost. They pin version, mask and every module.
  it('draws "HELLO WORLD" at level M module for module', () => {
    const symbol = encodeQr('HELLO WORLD')

    expect(symbol.version).toBe(1)
    expect(symbol.mask).toBe(4)
    expect(asArt(symbol)).toEqual([
      '#######.##..#.#######',
      '#.....#....#..#.....#',
      '#.###.#..#.#..#.###.#',
      '#.###.#.#..#..#.###.#',
      '#.###.#.###.#.#.###.#',
      '#.....#.#..#..#.....#',
      '#######.#.#.#.#######',
      '........#..##........',
      '#...#.######.#####..#',
      '...#....#.###....####',
      '..######..##.##.#..#.',
      '#####...##...#.......',
      '#####.#.#.#.#.##..##.',
      '........#.#.####.#.##',
      '#######.###.#.#.##.#.',
      '#.....#..#.###.##..##',
      '#.###.#.##.#.##...##.',
      '#.###.#..#..#...##.##',
      '#.###.#..###...###...',
      '#.....#....#.#.......',
      '#######.#########.#.#',
    ])
  })

  it('draws a Pix payload at level M module for module (version 8, with version info)', () => {
    const symbol = encodeQr(PIX)

    expect(bytesOf(PIX)).toHaveLength(137)
    expect(symbol.version).toBe(8)
    expect(symbol.mask).toBe(2)
    expect(asHex(symbol)).toEqual([
      '1fcda78ff817f',
      '1047007147741',
      '175468945a35d',
      '17552ce02d25d',
      '175a8ffeeb85d',
      '105225c64cc41',
      '1fd555555557f',
      '00160345f2300',
      '17cd767e0157c',
      '0daaa28259a52',
      '1bd30aaea7481',
      '09aa18a08b078',
      '09fec250231c7',
      '1b952880d8266',
      '0a53f23f35e99',
      '0a2030a8fa371',
      '044dc01245109',
      '06a3beb8482e9',
      '0344293664c0b',
      '1d2e24a35623b',
      '0ac7475aad144',
      '153e2ca0c3242',
      '0ff850fc7bdf5',
      '0919d4c5f2b19',
      '0b53d7d6cd15d',
      '11194cc65b31a',
      '17fd927c8ddf5',
      '012ccada9908b',
      '057674b087677',
      '099a0f9251a4e',
      '0842e1322b351',
      '09b8ab5e880a3',
      '13f20a6129f78',
      '0a19da13a8309',
      '17c779d14477b',
      '0a82d8af5208a',
      '15ccc72025375',
      '0c24ec9a60306',
      '08d3901829d61',
      '0e2650d5f4021',
      '1c5da97ec3bfd',
      '001236c64b31a',
      '1fc127d4a6559',
      '105938c462119',
      '175e2afc6d7f7',
      '17501c6ff39f9',
      '1755ead535a00',
      '1048c4bc70559',
      '1fd80012c9487',
    ])
  })

  it('encodes the empty string as a valid version 1 symbol', () => {
    const symbol = encodeQr('')

    expect(symbol.version).toBe(1)
    expect(readFormatNearTopLeft(symbol)).toBe(formatBits('M', symbol.mask))
  })

  it('defaults to level M', () => {
    expect(encodeQr('turystack').level).toBe('M')
    expect(encodeQr('turystack', { level: 'H' }).level).toBe('H')
  })
})
