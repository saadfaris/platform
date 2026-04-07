# RTL & Arabic localization setup

This fork of Huly is structurally prepared for a high-quality Arabic localization. **No strings have been translated yet** — the goal of this work is to make the UI fully RTL-capable and to provide an Arabic locale skeleton that translators can fill in manually, without further frontend changes.

English remains the default language and is visually unchanged.

---

## What changed

### 1. Direction infrastructure (`ltr` / `rtl`)

- New `platform.metadata.direction` (`'ltr' | 'rtl'`) declared in
  `foundations/core/packages/platform/src/platform.ts`.
- New helpers in `packages/theme/src/index.ts`:
  - `Direction` type
  - `RTL_LANGUAGES` set (currently `ar`, `he`, `fa`, `ur`)
  - `getDirectionForLanguage(lang)` — base-tag aware (`ar-SA` → `rtl`)
  - `getCurrentDirection()`
  - `directionStore` derived from `themeStore`
  - `direction` field on `ThemeOptions`
- `packages/theme/src/Theme.svelte` calls a single `applyDirection()` from
  both `setLanguage()` and `onMount()`. It keeps three things in sync:
  1. `document.documentElement.dir`
  2. `platform.metadata.direction` (so non-Svelte code can read it)
  3. The reactive `currentDirection` writable / `direction` context.
- `dev/prod/src/index.ejs` and `desktop/src/ui/index.ejs` now start with
  `<html lang="en" dir="ltr">` so the very first paint is correct in LTR.

### 2. Arabic placeholder locale

- Added `'ar'` to the supported-languages list in
  `dev/prod/src/platform.ts` and `desktop/src/ui/platform.ts`.
- Added `ui.string.Arabic` IntlString in `packages/ui/src/plugin.ts` and
  `"Arabic"` keys to **all** existing UI locale catalogues.
- Added the Arabic option to the language picker
  `packages/ui/src/components/internal/SettingsPopup.svelte`.
- Generated **66 placeholder `lang/ar.json` files** — one for every plugin,
  package, and service that ships an `en.json`. Each file is a byte-for-byte
  copy of its English sibling. Because the platform i18n loader falls back
  to English on missing keys, the UI keeps displaying English until a
  translator manually edits the values.
- Added `scripts/create-ar-locale.js`. Idempotent. Run again whenever a new
  plugin is added that ships an `en.json`:
  ```sh
  node scripts/create-ar-locale.js          # create missing only
  node scripts/create-ar-locale.js --force  # rewrite from English (DANGEROUS once translated)
  ```

### 3. Logical CSS migration (the bulk of real RTL support)

- 210 physical-direction CSS properties (`margin-left/right`,
  `padding-left/right`, `border-left/right`, `text-align: left/right`)
  replaced with their logical-property equivalents
  (`margin-inline-start/end`, `padding-inline-start/end`,
  `border-inline-start/end`, `text-align: start/end`) across 10 SCSS files
  in `packages/theme/styles/`. The visual result in LTR is identical;
  every rule auto-mirrors when `<html dir="rtl">`.
- Spacing utility classes (`.ml-*`, `.mr-*`, `.pl-*`, `.pr-*`, `.text-left`,
  `.text-right`) now resolve to logical properties internally, so existing
  `class="ml-2"` usages mirror in RTL without renaming anything.
- New `packages/theme/styles/_rtl.scss`:
  - `.flip-rtl` utility — mirrors a directional icon only when the document
    is RTL. Used selectively for chevrons / back arrows / breadcrumb
    separators. Not a global "flip everything" rule.
- New `packages/theme/styles/_fonts-arabic.scss`:
  - Loads IBM Plex Sans Arabic from Google Fonts CDN.
  - Font family is only swapped in via `html[dir="rtl"] body { ... }`,
    so English typography is untouched.
- `packages/theme/styles/mixins.scss` extended with `margin-inline`,
  `padding-inline`, `inset-inline` helper mixins; `bg-fullsize` now uses
  logical insets.
- Both new partials are imported from `global.scss`.

### 4. Component-level RTL fixes

- `packages/ui/src/popups.ts`:
  - New exported `isRTL()` helper.
  - Submenu opening side and explicit `position.h` (`'left' | 'right'`)
    preferences flip in RTL so menus open toward the inline-end edge.
  - Viewport-anchored popups (logo, account, notify, status, help-center,
    movable, float, ...) get their `left`/`right` swapped on output so they
    pin to the mirrored corner of the viewport.
  - Trigger-anchored popups (computed from `getBoundingClientRect()`) are
    intentionally not mirrored because their pixel math is already
    direction-agnostic.
- `packages/theme/styles/popups.scss`: submenu caret uses
  `inset-inline-end`; the `▶` glyph flips to `◀` in `dir="rtl"`.
- `packages/ui/src/components/Breadcrumbs.svelte`: chevron separators wear
  `flip-rtl`.
- `packages/ui/src/components/AccordionItem.svelte`: toggle chevron wears
  `flip-rtl`.

---

## How RTL works at runtime

1. The user picks a language in **Settings → Language**.
2. `Theme.svelte#setLanguage()` writes to `localStorage.lang`,
   `platform.metadata.locale`, calls `applyDirection(lang)`, then reloads
   plugin string catalogues.
3. `applyDirection()` resolves `getDirectionForLanguage(lang)` and writes
   the result to:
   - `document.documentElement.dir`
   - `platform.metadata.direction`
   - the `currentDirection` Svelte store
4. The whole CSS layer (logical properties + the `_rtl.scss` overrides)
   mirrors automatically.
5. Selected components react to direction in JavaScript via `isRTL()` from
   `@hcengineering/ui` (popup positioning, etc.).

To enable Arabic for testing without going through the picker:

```js
localStorage.setItem('lang', 'ar')
location.reload()
```

To go back to English:

```js
localStorage.setItem('lang', 'en')
location.reload()
```

---

## Where to translate Arabic

Edit any of the **66 `lang/ar.json` files** below. They are valid JSON
catalogues with the same key shape as the matching `en.json`. The platform
i18n loader (`foundations/core/packages/platform/src/i18n.ts`) silently
falls back to English on missing keys, so partial translations are safe —
you can ship an Arabic value at any time without breaking the build.

Use the [IBM Plex Sans Arabic glyphs](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic)
as the source-of-truth font when designing copy, since it is what the UI
will render in RTL.

### Files to translate

#### Core
- `foundations/core/packages/core/lang/ar.json`
- `foundations/core/packages/platform/lang/ar.json`

#### Shared UI
- `packages/presentation/lang/ar.json`
- `packages/ui/lang/ar.json`

#### Plugins (assets)

`achievement`, `activity`, `ai-assistant`, `analytics-collector`,
`attachment`, `billing`, `bitrix`, `board`, `calendar`, `card`, `chat`,
`chunter`, `communication`, `contact`, `controlled-documents`,
`desktop-downloads`, `desktop-preferences`, `diffview`, `document`,
`drive`, `emoji`, `export`, `global-profile`, `gmail`, `guest`, `hr`,
`huly-mail`, `inbox`, `inventory`, `lead`, `login`, `love`, `mail`,
`media`, `notification`, `onboard`, `preference`, `print`, `process`,
`products`, `questions`, `rating`, `recorder`, `recruit`, `request`,
`setting`, `support`, `survey`, `tags`, `task`, `telegram`, `templates`,
`test-management`, `text-editor`, `time`, `tracker`, `training`,
`uploader`, `view`, `workbench` — each at
`plugins/<name>-assets/lang/ar.json`.

#### Server / services
- `server/account/lang/ar.json`
- `services/github/github-assets/lang/ar.json`

---

## Visual QA checklist (after real Arabic strings land)

The structural work above is complete, but the following components are
worth a careful pass once a translator provides actual Arabic content,
because they contain layout assumptions that are hard to verify with
English placeholders alone:

- [ ] **Popup edge math** — open submenus, action menus, and date pickers
      near the edges of the viewport in RTL and confirm they stay on screen.
- [ ] **Scroller component** — `packages/ui/src/components/Scroller.svelte`
      uses `scrollLeft` arithmetic. Browsers differ in how they sign
      `scrollLeft` under RTL; the math has not been refactored. Test
      horizontal scrollers (kanban boards, wide tables).
- [ ] **TipTap rich text editor** — `plugins/text-editor*`. Inline
      cursors, mention menus, slash menus, drag handles.
- [ ] **Calendar grid** — `packages/ui/src/components/calendar/*` and
      `plugins/calendar`. Week start, month navigation arrows.
- [ ] **Kanban / tracker boards** — drag-and-drop placeholders,
      column ordering.
- [ ] **Charts** — `plugins/billing`, analytics: axes, legends.
- [ ] **Drop shadows / gradients** — anything that uses `box-shadow:` or
      `linear-gradient(to right, ...)` may need an RTL-specific override
      in `packages/theme/styles/_rtl.scss`.
- [ ] **Inline `style="margin-left: ..."`** in Svelte components — the
      bulk migration covered the SCSS layer; inline styles in less-used
      components should be converted to logical properties as they are
      touched. Search for `style="(margin|padding)-(left|right)`.
- [ ] **Authentication / onboarding screens** — `plugins/login`,
      `plugins/onboard`. These tend to have hand-crafted hero layouts.
- [ ] **Settings pages** — `plugins/setting`. Lots of two-column forms.
- [ ] **Notifications & toasts** — slide-in direction.
- [ ] **Activity feed** — `plugins/activity`. Timeline rail position.
- [ ] **Keyboard navigation** — components that bind `ArrowLeft` /
      `ArrowRight` to "previous"/"next" should swap meaning in RTL.
      Search for `ArrowLeft`, `ArrowRight` in `packages/ui/src/components`.

---

## Known limitations / follow-up work

- **Server-side i18n** — `server/account` and other server packages now
  ship `lang/ar.json` placeholders, but the server pipeline at
  `server/server-pipeline/src/internationalization.ts` currently hardcodes
  English-only loaders. Adding Arabic email/notification text from the
  server side will require extending that registry.
- **Self-host IBM Plex Sans Arabic** — currently loaded from Google Fonts
  CDN for simplicity. For privacy and offline support, switch to bundled
  woff2 files in `packages/theme/styles/_fonts-arabic.scss`.
- **Other RTL locales** — Hebrew (`he`), Persian (`fa`), and Urdu (`ur`)
  are recognized by `RTL_LANGUAGES` but no placeholder catalogues were
  generated for them. Run `scripts/create-ar-locale.js` adapted for the
  target locale, or `cp` the files manually.
- **Number / date formatting** — `intl-messageformat` is already used and
  will pick up locale-specific formatting automatically once Arabic strings
  land. Verify with mixed-direction numerals (Arabic-Indic digits vs Western).
- **Bidi-aware editor** — the TipTap rich text editor does not yet emit
  `dir="auto"` per paragraph. Mixed-direction documents may need additional
  configuration.
- **Inline-style drift** — every new Svelte component should prefer logical
  CSS properties going forward. A lint rule to forbid `margin-left` /
  `padding-right` in `packages/theme/styles` and shared `packages/ui/src`
  would prevent regressions.

---

## Quick verification

After pulling this branch:

```sh
# build
node common/scripts/install-run-rush.js install
node common/scripts/install-run-rush.js build

# in the running app, open DevTools and:
document.documentElement.dir   // 'ltr'
localStorage.setItem('lang', 'ar'); location.reload()
document.documentElement.dir   // 'rtl'
document.documentElement.lang  // 'ar'
```

The sidebar should be on the right, the chevrons in the breadcrumbs and
accordion should point with the reading direction, the body font should be
IBM Plex Sans Arabic, and **all visible text should still be in English**
(this is correct — translation is the next step).
