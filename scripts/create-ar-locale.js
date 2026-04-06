#!/usr/bin/env node
//
// Create Arabic (ar) locale placeholder files for every plugin/package that
// has an English (en.json) translation catalogue.
//
// The placeholder files contain a byte-for-byte copy of the English catalogue
// so that:
//   * the runtime locale loader (webpack dynamic import of `lang/${lang}.json`)
//     resolves successfully when the user picks Arabic, and
//   * the UI displays the English source until a translator manually replaces
//     the values in lang/ar.json.
//
// Idempotent. Existing ar.json files are left untouched unless --force is
// passed (use that with care: it will overwrite human translations).
//
// Usage:
//   node scripts/create-ar-locale.js          # create missing files only
//   node scripts/create-ar-locale.js --force  # rewrite every ar.json from en.json
//

'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const FORCE = process.argv.includes('--force')

const SKIP_DIRS = new Set(['node_modules', '.git', '.rush', 'dist', 'lib', 'build', 'temp', '.heft'])
// Translation fixture used by the platform unit tests; should not get an
// Arabic placeholder because the tests assert exact loader behavior.
const SKIP_PATHS = new Set([
  path.join(ROOT, 'foundations', 'core', 'packages', 'platform', 'src', '__tests__', 'lang')
])

let created = 0
let skipped = 0

function walk (dir) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (err) {
    return
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      if (SKIP_PATHS.has(full)) continue
      walk(full)
      continue
    }
    if (entry.name !== 'en.json') continue
    if (path.basename(path.dirname(full)) !== 'lang') continue
    const target = path.join(path.dirname(full), 'ar.json')
    if (fs.existsSync(target) && !FORCE) {
      skipped++
      continue
    }
    fs.copyFileSync(full, target)
    created++
    console.log('wrote', path.relative(ROOT, target))
  }
}

walk(ROOT)
console.log(`\nDone. Created ${created} file(s), skipped ${skipped} existing file(s).`)
