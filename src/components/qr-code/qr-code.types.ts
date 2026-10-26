/**
 * QrCode
 *
 * A QR code for a string — a Pix "copia e cola" payload, a pairing link, a
 * ticket id — drawn as an SVG from the library's own encoder, with no
 * dependency.
 *
 * Behavior:
 * - `value` is encoded as UTF-8 in byte mode; the smallest version (1–40)
 *   that holds it at `level` is chosen, and the mask with the lowest ISO
 *   penalty score. A Pix payload (~150–250 bytes) lands around version 8–11
 *   at level M
 * - `level` is the error correction: L (7%), M (15%, default), Q (25%),
 *   H (30%). A `logo` covers the centre modules, so it forces H whatever
 *   `level` says
 * - Black modules on white in every colour scheme, with the 4-module quiet
 *   zone the standard asks for drawn inside the square. It is deliberately not
 *   themed: a payment code has to scan in any bank app, and some readers still
 *   reject light-on-dark (reversed) symbols
 * - `size` sets the rendered square: sm (128px), md (192px, default),
 *   lg (256px); the symbol scales inside it, crisp at any density
 * - `label` is required: the code is exposed as one image (`role="img"`)
 *   named by it, since a screen reader cannot read the modules and the reader
 *   needs to know what scanning it does
 * - A value longer than version 40 holds at the level (2331 bytes at M) is a
 *   programming error and throws
 *
 * Implementation:
 * - `qr-code.encoder.ts`: byte mode, Reed–Solomon over GF(256), all 40
 *   versions, the eight masks and the four penalty rules
 * - One `<path>` for the dark modules (a horizontal run per segment), one
 *   `<rect>` for the background, `shape-rendering="crispEdges"`
 * - <QrCode label="Pix QR code for R$ 42,00" value={pixPayload} />
 * - <QrCode label="Pair your phone" logo={<Logo />} size="lg" value={url} />
 *
 * Dependencies: none
 */

export type QrCodeSize = 'sm' | 'md' | 'lg'

export type QrCodeLevel = 'L' | 'M' | 'Q' | 'H'

export type QrCodeProps = {
  value: string // the text to encode, as UTF-8
  label: string // accessible name of the code — what scanning it does (required)
  size?: QrCodeSize // rendered square; default md
  level?: QrCodeLevel // error correction; default M, forced to H by a logo
  logo?: React.ReactNode // centred overlay (a brand mark); forces level H
}
