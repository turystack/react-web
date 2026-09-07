#!/usr/bin/env node

/**
 * Every path `package.json` promises has to exist in `dist`.
 *
 * `vite build` exits 0 whether or not the declaration emit landed where the
 * manifest says it did. It moved once already: adding `tests/setup.ts` put a
 * file outside `src` into the declaration set, which lifted the common root up
 * to the package, wrote every `.d.ts` under `dist/src/`, and left
 * `types: ./dist/index.d.ts` resolving to nothing. Consumers got a package with
 * no types at all and nothing in this repo noticed, because the only signal was
 * a file that was not there.
 */

import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(
  await import('node:fs/promises').then((fs) =>
    fs.readFile(resolve(ROOT, 'package.json'), 'utf8'),
  ),
)

const claims = []

function claim(path, where) {
  if (typeof path === 'string' && path.startsWith('./')) {
    claims.push({ path, where })
  }
}

for (const field of ['main', 'module', 'types']) {
  claim(manifest[field], field)
}

for (const [entry, value] of Object.entries(manifest.exports ?? {})) {
  if (typeof value === 'string') {
    claim(value, `exports["${entry}"]`)
    continue
  }
  for (const [condition, target] of Object.entries(value ?? {})) {
    claim(target, `exports["${entry}"].${condition}`)
  }
}

const missing = claims.filter(({ path }) => !existsSync(resolve(ROOT, path)))

if (missing.length > 0) {
  console.error(`\n✖ ${missing.length} declared entry point(s) missing on disk:`)
  for (const { path, where } of missing) {
    console.error(`  ${path} — promised by ${where}`)
  }
  console.error('')
  process.exit(1)
}

console.log(`\n✓ ${claims.length} declared entry point(s) exist in dist\n`)
