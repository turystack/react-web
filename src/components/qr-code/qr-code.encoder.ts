/**
 * A QR Code encoder, ISO/IEC 18004 — byte mode only, versions 1 to 40.
 *
 * Why it exists: a Pix "copia e cola" payload is the whole reason a product
 * screen shows a QR code, and pulling a dependency in to draw one square of
 * modules is a dependency every consumer then carries. The encoder is pure: a
 * string goes in, a square boolean matrix comes out (`true` is a dark module),
 * with no quiet zone — the renderer adds it.
 *
 * The pipeline, in the standard's order:
 * 1. UTF-8 bytes, byte mode (`0100`), character count, terminator, pad bytes
 * 2. The smallest version whose data capacity at the chosen level fits them
 * 3. Split into blocks, Reed–Solomon over GF(256) (polynomial 0x11D) per
 *    block, then interleave data and error-correction codewords
 * 4. Function patterns (finders, separators, timing, alignment, dark module,
 *    format and version areas), the codewords in the two-column zig-zag,
 *    every one of the eight masks scored by the four penalty rules, the
 *    cheapest kept, and its format information written last
 */

import type { QrCodeLevel } from './qr-code.types'

export type QrMatrix = {
  /** Modules per side: `4 × version + 17`. */
  size: number
  version: number
  level: QrCodeLevel
  /** The mask pattern chosen by the penalty score, 0–7. */
  mask: number
  /** `modules[row][column]`; `true` is a dark module. */
  modules: boolean[][]
}

export const QR_MIN_VERSION = 1
export const QR_MAX_VERSION = 40

/** Level → row in the tables below, and the two bits the format info carries. */
const LEVEL_INDEX: Record<QrCodeLevel, number> = {
  H: 3,
  L: 0,
  M: 1,
  Q: 2,
}

const LEVEL_FORMAT_BITS: Record<QrCodeLevel, number> = {
  H: 2,
  L: 1,
  M: 0,
  Q: 3,
}

// ISO/IEC 18004 table 9, one row per level (L, M, Q, H), indexed by version.
// Index 0 is padding so the version reads the column directly.
const ECC_CODEWORDS_PER_BLOCK: readonly (readonly number[])[] = [
  [
    -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30,
    28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ],
  [
    -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26,
    26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28,
  ],
  [
    -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28,
    26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ],
  [
    -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28,
    26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    30, 30, 30,
  ],
]

const ERROR_CORRECTION_BLOCKS: readonly (readonly number[])[] = [
  [
    -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10,
    12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ],
  [
    -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17,
    17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ],
  [
    -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23,
    23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ],
  [
    -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25,
    25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77,
    81,
  ],
]

// Penalty weights, ISO/IEC 18004 §7.8.3.1 (N1–N4).
const PENALTY_RUN = 3
const PENALTY_BLOCK = 3
const PENALTY_FINDER = 40
const PENALTY_BALANCE = 10

// ---------------------------------------------------------------------------
// Capacity

/** Modules left for data (and remainder bits) once every function pattern is placed. */
export function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64

  if (version >= 2) {
    const alignments = Math.floor(version / 7) + 2
    result -= (25 * alignments - 10) * alignments - 55

    if (version >= 7) {
      result -= 36
    }
  }

  return result
}

/** 8-bit data codewords a version holds at a level, error correction excluded. */
export function dataCodewords(version: number, level: QrCodeLevel): number {
  const row = LEVEL_INDEX[level]

  return (
    Math.floor(rawDataModules(version) / 8) -
    (ECC_CODEWORDS_PER_BLOCK[row]?.[version] ?? 0) *
      (ERROR_CORRECTION_BLOCKS[row]?.[version] ?? 0)
  )
}

function characterCountBits(version: number): number {
  return version <= 9 ? 8 : 16
}

/** The most bytes byte mode fits into a version at a level. */
export function byteCapacity(version: number, level: QrCodeLevel): number {
  const bits =
    dataCodewords(version, level) * 8 - 4 - characterCountBits(version)

  return Math.floor(bits / 8)
}

/** Alignment pattern centres, the same list for rows and columns. */
export function alignmentPositions(version: number): number[] {
  if (version === 1) {
    return []
  }

  const count = Math.floor(version / 7) + 2
  const size = version * 4 + 17
  const step =
    version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2
  const result = [6]

  for (let position = size - 7; result.length < count; position -= step) {
    result.splice(1, 0, position)
  }

  return result
}

// ---------------------------------------------------------------------------
// BCH codes

/** The 15 format bits: level and mask, BCH(15,5), XOR-masked with 0x5412. */
export function formatBits(level: QrCodeLevel, mask: number): number {
  const data = (LEVEL_FORMAT_BITS[level] << 3) | mask
  let remainder = data

  for (let index = 0; index < 10; index++) {
    remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537)
  }

  return ((data << 10) | remainder) ^ 0x5412
}

/** The 18 version bits for version 7 and up: BCH(18,6), unmasked. */
export function versionBits(version: number): number {
  let remainder = version

  for (let index = 0; index < 12; index++) {
    remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25)
  }

  return (version << 12) | remainder
}

// ---------------------------------------------------------------------------
// Reed–Solomon over GF(2^8), primitive polynomial x^8 + x^4 + x^3 + x^2 + 1

export function gfMultiply(left: number, right: number): number {
  let product = 0

  for (let bit = 7; bit >= 0; bit--) {
    product = (product << 1) ^ ((product >>> 7) * 0x11d)
    product ^= ((right >>> bit) & 1) * left
  }

  return product & 0xff
}

/** Coefficients of ∏(x − α^i), i < degree, highest term dropped (it is always 1). */
export function reedSolomonDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0)
  result[degree - 1] = 1
  let root = 1

  for (let index = 0; index < degree; index++) {
    for (let term = 0; term < result.length; term++) {
      result[term] = gfMultiply(result[term] ?? 0, root)

      if (term + 1 < result.length) {
        result[term] = (result[term] ?? 0) ^ (result[term + 1] ?? 0)
      }
    }

    root = gfMultiply(root, 0x02)
  }

  return result
}

/** The error-correction codewords for `data`: the remainder of data·x^n ÷ divisor. */
export function reedSolomonRemainder(
  data: readonly number[],
  divisor: readonly number[],
): number[] {
  const result = new Array<number>(divisor.length).fill(0)

  for (const byte of data) {
    const factor = byte ^ (result.shift() ?? 0)
    result.push(0)

    for (let index = 0; index < divisor.length; index++) {
      result[index] =
        (result[index] ?? 0) ^ gfMultiply(divisor[index] ?? 0, factor)
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Data codewords

function utf8(value: string): number[] {
  return Array.from(new TextEncoder().encode(value))
}

/** The smallest version whose byte capacity at `level` holds `length` bytes. */
export function chooseVersion(length: number, level: QrCodeLevel): number {
  for (let version = QR_MIN_VERSION; version <= QR_MAX_VERSION; version++) {
    if (length <= byteCapacity(version, level)) {
      return version
    }
  }

  throw new RangeError(
    `QR code: ${length} bytes do not fit version 40 at level ${level} (max ${byteCapacity(QR_MAX_VERSION, level)})`,
  )
}

/** Mode, count, bytes, terminator and padding — the data codewords of one symbol. */
export function dataCodewordsFor(
  bytes: readonly number[],
  version: number,
  level: QrCodeLevel,
): number[] {
  const bits: number[] = []
  const append = (value: number, length: number) => {
    for (let bit = length - 1; bit >= 0; bit--) {
      bits.push((value >>> bit) & 1)
    }
  }

  append(0b0100, 4)
  append(bytes.length, characterCountBits(version))

  for (const byte of bytes) {
    append(byte, 8)
  }

  const capacity = dataCodewords(version, level) * 8
  append(0, Math.min(4, capacity - bits.length))
  append(0, (8 - (bits.length % 8)) % 8)

  const codewords: number[] = []

  for (let index = 0; index < bits.length; index += 8) {
    let byte = 0

    for (let bit = 0; bit < 8; bit++) {
      byte = (byte << 1) | (bits[index + bit] ?? 0)
    }

    codewords.push(byte)
  }

  for (let pad = 0xec; codewords.length < capacity / 8; pad ^= 0xec ^ 0x11) {
    codewords.push(pad)
  }

  return codewords
}

/** Data codewords split into blocks, each followed by its ECC, then interleaved. */
export function interleaveWithErrorCorrection(
  data: readonly number[],
  version: number,
  level: QrCodeLevel,
): number[] {
  const row = LEVEL_INDEX[level]
  const blockCount = ERROR_CORRECTION_BLOCKS[row]?.[version] ?? 1
  const eccLength = ECC_CODEWORDS_PER_BLOCK[row]?.[version] ?? 0
  const rawCodewords = Math.floor(rawDataModules(version) / 8)
  const shortBlocks = blockCount - (rawCodewords % blockCount)
  const shortBlockLength = Math.floor(rawCodewords / blockCount)
  const divisor = reedSolomonDivisor(eccLength)

  const blocks: { data: number[]; ecc: number[] }[] = []

  for (let index = 0, offset = 0; index < blockCount; index++) {
    const length = shortBlockLength - eccLength + (index < shortBlocks ? 0 : 1)
    const chunk = data.slice(offset, offset + length)
    offset += length
    blocks.push({ data: chunk, ecc: reedSolomonRemainder(chunk, divisor) })
  }

  const result: number[] = []
  const longest = shortBlockLength - eccLength + 1

  for (let index = 0; index < longest; index++) {
    for (const block of blocks) {
      const codeword = block.data[index]

      if (codeword !== undefined) {
        result.push(codeword)
      }
    }
  }

  for (let index = 0; index < eccLength; index++) {
    for (const block of blocks) {
      result.push(block.ecc[index] ?? 0)
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Matrix

type Grid = {
  size: number
  modules: boolean[][]
  reserved: boolean[][]
}

function createGrid(size: number): Grid {
  return {
    modules: Array.from({ length: size }, () =>
      new Array<boolean>(size).fill(false),
    ),
    reserved: Array.from({ length: size }, () =>
      new Array<boolean>(size).fill(false),
    ),
    size,
  }
}

/** Paints a function module and marks it off-limits to data and masking. */
function setFunction(grid: Grid, column: number, row: number, dark: boolean) {
  const modules = grid.modules[row]
  const reserved = grid.reserved[row]

  if (modules && reserved) {
    modules[column] = dark
    reserved[column] = true
  }
}

function bitAt(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0
}

/** Finder at centre (cx, cy) with its separator — out-of-range cells skipped. */
function drawFinder(grid: Grid, cx: number, cy: number) {
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy))
      const column = cx + dx
      const row = cy + dy

      if (column >= 0 && column < grid.size && row >= 0 && row < grid.size) {
        setFunction(grid, column, row, distance !== 2 && distance !== 4)
      }
    }
  }
}

function drawAlignment(grid: Grid, cx: number, cy: number) {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      setFunction(
        grid,
        cx + dx,
        cy + dy,
        Math.max(Math.abs(dx), Math.abs(dy)) !== 1,
      )
    }
  }
}

/** Both copies of the format information, plus the always-dark module. */
function drawFormat(grid: Grid, level: QrCodeLevel, mask: number) {
  const bits = formatBits(level, mask)
  const { size } = grid

  // First copy, around the top-left finder.
  for (let index = 0; index <= 5; index++) {
    setFunction(grid, 8, index, bitAt(bits, index))
  }
  setFunction(grid, 8, 7, bitAt(bits, 6))
  setFunction(grid, 8, 8, bitAt(bits, 7))
  setFunction(grid, 7, 8, bitAt(bits, 8))
  for (let index = 9; index < 15; index++) {
    setFunction(grid, 14 - index, 8, bitAt(bits, index))
  }

  // Second copy, split between the top-right and bottom-left finders.
  for (let index = 0; index < 8; index++) {
    setFunction(grid, size - 1 - index, 8, bitAt(bits, index))
  }
  for (let index = 8; index < 15; index++) {
    setFunction(grid, 8, size - 15 + index, bitAt(bits, index))
  }
  setFunction(grid, 8, size - 8, true)
}

function drawVersion(grid: Grid, version: number) {
  if (version < 7) {
    return
  }

  const bits = versionBits(version)

  for (let index = 0; index < 18; index++) {
    const dark = bitAt(bits, index)
    const near = grid.size - 11 + (index % 3)
    const far = Math.floor(index / 3)
    setFunction(grid, near, far, dark)
    setFunction(grid, far, near, dark)
  }
}

function drawFunctionPatterns(grid: Grid, version: number) {
  const { size } = grid

  for (let index = 0; index < size; index++) {
    setFunction(grid, 6, index, index % 2 === 0)
    setFunction(grid, index, 6, index % 2 === 0)
  }

  drawFinder(grid, 3, 3)
  drawFinder(grid, size - 4, 3)
  drawFinder(grid, 3, size - 4)

  const positions = alignmentPositions(version)
  const last = positions.length - 1

  for (let i = 0; i < positions.length; i++) {
    for (let j = 0; j < positions.length; j++) {
      const overlapsFinder =
        (i === 0 && j === 0) ||
        (i === 0 && j === last) ||
        (i === last && j === 0)

      if (!overlapsFinder) {
        drawAlignment(grid, positions[i] ?? 0, positions[j] ?? 0)
      }
    }
  }

  // Reserve the format areas with a placeholder; the real bits land last.
  drawFormat(grid, 'L', 0)
  drawVersion(grid, version)
}

/** Codeword bits, most significant first, up the right edge in two-column strips. */
function drawCodewords(grid: Grid, codewords: readonly number[]) {
  const { size } = grid
  const total = codewords.length * 8
  let bit = 0

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right = 5
    }

    for (let step = 0; step < size; step++) {
      for (let offset = 0; offset < 2; offset++) {
        const column = right - offset
        const upward = ((right + 1) & 2) === 0
        const row = upward ? size - 1 - step : step

        if (!grid.reserved[row]?.[column] && bit < total) {
          const modules = grid.modules[row]

          if (modules) {
            modules[column] = bitAt(codewords[bit >>> 3] ?? 0, 7 - (bit & 7))
          }
          bit++
        }
        // Remainder modules stay light (false); the mask still applies to them.
      }
    }
  }
}

/** The eight mask conditions, `column` then `row` (ISO/IEC 18004 table 10). */
export function maskApplies(
  mask: number,
  column: number,
  row: number,
): boolean {
  switch (mask) {
    case 0:
      return (column + row) % 2 === 0
    case 1:
      return row % 2 === 0
    case 2:
      return column % 3 === 0
    case 3:
      return (column + row) % 3 === 0
    case 4:
      return (Math.floor(column / 3) + Math.floor(row / 2)) % 2 === 0
    case 5:
      return ((column * row) % 2) + ((column * row) % 3) === 0
    case 6:
      return (((column * row) % 2) + ((column * row) % 3)) % 2 === 0
    case 7:
      return (((column + row) % 2) + ((column * row) % 3)) % 2 === 0
    default:
      throw new RangeError(`QR code: mask ${mask} is not 0–7`)
  }
}

/** XORs the mask over every data module; applying it twice undoes it. */
function applyMask(grid: Grid, mask: number) {
  for (let row = 0; row < grid.size; row++) {
    const modules = grid.modules[row]
    const reserved = grid.reserved[row]

    for (let column = 0; column < grid.size; column++) {
      if (
        modules &&
        reserved &&
        !reserved[column] &&
        maskApplies(mask, column, row)
      ) {
        modules[column] = !modules[column]
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Penalty (ISO/IEC 18004 §7.8.3)

/**
 * Pushes a finished run onto the history (newest first). The first run of a
 * line is lengthened by the line's size: the quiet zone beyond the edge is
 * light, so a pattern touching the edge still counts.
 */
function pushRun(length: number, history: number[], size: number) {
  history.pop()
  history.unshift(history[0] === 0 ? length + size : length)
}

/** Finder-like 1:1:3:1:1 runs flanked by 4 light modules on either side. */
function countFinderLike(history: readonly number[]): number {
  const [before = 0, n = 0, b = 0, c = 0, d = 0, e = 0, after = 0] = history
  const core = n > 0 && b === n && c === n * 3 && d === n && e === n

  return (
    (core && before >= n * 4 && after >= n ? 1 : 0) +
    (core && after >= n * 4 && before >= n ? 1 : 0)
  )
}

function lineScore(line: readonly boolean[], size: number): number {
  let score = 0
  let color = false
  let run = 0
  const history = [0, 0, 0, 0, 0, 0, 0]

  for (const dark of line) {
    if (dark === color) {
      run++

      if (run === 5) {
        score += PENALTY_RUN
      } else if (run > 5) {
        score++
      }
    } else {
      pushRun(run, history, size)

      if (!color) {
        score += countFinderLike(history) * PENALTY_FINDER
      }
      color = dark
      run = 1
    }
  }

  // Close the line against the light quiet zone.
  if (color) {
    pushRun(run, history, size)
    run = 0
  }
  pushRun(run + size, history, size)
  score += countFinderLike(history) * PENALTY_FINDER

  return score
}

export function penaltyScore(modules: readonly (readonly boolean[])[]): number {
  const size = modules.length
  let score = 0

  for (let row = 0; row < size; row++) {
    score += lineScore(modules[row] ?? [], size)
  }

  for (let column = 0; column < size; column++) {
    score += lineScore(
      modules.map((line) => line[column] ?? false),
      size,
    )
  }

  for (let row = 0; row < size - 1; row++) {
    for (let column = 0; column < size - 1; column++) {
      const color = modules[row]?.[column]

      if (
        color === modules[row]?.[column + 1] &&
        color === modules[row + 1]?.[column] &&
        color === modules[row + 1]?.[column + 1]
      ) {
        score += PENALTY_BLOCK
      }
    }
  }

  let dark = 0

  for (const line of modules) {
    for (const module of line) {
      dark += module ? 1 : 0
    }
  }

  const total = size * size
  // The smallest k with |dark/total − 1/2| ≤ (k + 1)/20.
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1
  score += Math.max(0, k) * PENALTY_BALANCE

  return score
}

// ---------------------------------------------------------------------------
// Entry points

export type QrEncodeOptions = {
  level?: QrCodeLevel // default M
  mask?: number // force a mask 0–7; default: the lowest penalty
}

/** Encodes raw bytes; the version is the smallest that fits. */
export function encodeQrBytes(
  bytes: readonly number[],
  { level = 'M', mask }: QrEncodeOptions = {},
): QrMatrix {
  const version = chooseVersion(bytes.length, level)
  const size = version * 4 + 17
  const codewords = interleaveWithErrorCorrection(
    dataCodewordsFor(bytes, version, level),
    version,
    level,
  )

  const grid = createGrid(size)
  drawFunctionPatterns(grid, version)
  drawCodewords(grid, codewords)

  let chosen = mask ?? -1

  if (chosen === -1) {
    let lowest = Number.POSITIVE_INFINITY

    for (let candidate = 0; candidate < 8; candidate++) {
      applyMask(grid, candidate)
      drawFormat(grid, level, candidate)
      const score = penaltyScore(grid.modules)

      if (score < lowest) {
        lowest = score
        chosen = candidate
      }
      applyMask(grid, candidate)
    }
  }

  applyMask(grid, chosen)
  drawFormat(grid, level, chosen)

  return {
    level,
    mask: chosen,
    modules: grid.modules,
    size,
    version,
  }
}

/** Encodes a string as UTF-8 in byte mode. */
export function encodeQr(value: string, options?: QrEncodeOptions): QrMatrix {
  return encodeQrBytes(utf8(value), options)
}

/** Which modules are function patterns — exposed for structural tests. */
export function functionModules(version: number): boolean[][] {
  const grid = createGrid(version * 4 + 17)
  drawFunctionPatterns(grid, version)

  return grid.reserved
}
