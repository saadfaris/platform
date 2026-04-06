//
// Copyright © 2020 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { Analytics } from '@hcengineering/analytics'
import '@hcengineering/platform-rig/profiles/ui/svelte'
import { derived, writable } from 'svelte/store'
import { ThemeVariant, type ThemeVariantType } from './variants'

/**
 * @public
 * Text direction for a UI locale.
 */
export type Direction = 'ltr' | 'rtl'

/**
 * @public
 * Languages whose script is written right-to-left.
 * Centralized so that adding a new RTL locale is a one-line change.
 */
export const RTL_LANGUAGES: ReadonlySet<string> = new Set(['ar', 'he', 'fa', 'ur'])

/**
 * @public
 * Returns 'rtl' for known RTL locales (matched on the base language tag,
 * so 'ar', 'ar-SA', 'ar-EG' all resolve to 'rtl'), 'ltr' otherwise.
 */
export const getDirectionForLanguage = (language: string | undefined | null): Direction => {
  if (language == null || language === '') return 'ltr'
  const base = language.toLowerCase().split(/[-_]/)[0]
  return RTL_LANGUAGES.has(base) ? 'rtl' : 'ltr'
}

export { default as Theme } from './Theme.svelte'
export { default as InvertedTheme } from './InvertedTheme.svelte'
export { ThemeVariant, type ThemeVariantType } from './variants'

/**
 * @public
 */
export const setDefaultLanguage = (language: string): void => {
  if (localStorage.getItem('lang') === null) {
    localStorage.setItem('lang', language)
  }
}

function getDefaultProps (prop: string, value: string): string {
  localStorage.setItem(prop, value)
  return value
}

/**
 * @public
 */
export const isSystemThemeDark = (): boolean => window.matchMedia('(prefers-color-scheme: dark)').matches
/**
 * @public
 */
export const isThemeDark = (theme: string): boolean =>
  theme === 'theme-dark' || (theme === 'theme-system' && isSystemThemeDark())
/**
 * @public
 */
export const getCurrentTheme = (): string => localStorage.getItem('theme') ?? getDefaultProps('theme', 'theme-system')
/**
 * @public
 */
export const getCurrentFontSize = (): string =>
  localStorage.getItem('fontsize') ?? getDefaultProps('fontsize', 'normal-font')
/**
 * @public
 */
export const getCurrentLanguage = (): string => {
  const lang = localStorage.getItem('lang') ?? getDefaultProps('lang', 'en')
  Analytics.setTag('language', lang)
  return lang
}
/**
 * @public
 */
export const getCurrentEmoji = (): string => localStorage.getItem('emoji') ?? getDefaultProps('emoji', 'emoji-system')

/**
 * @public
 * Resolved text direction for the currently selected UI language.
 */
export const getCurrentDirection = (): Direction => getDirectionForLanguage(getCurrentLanguage())

export class ThemeOptions {
  readonly variant: ThemeVariantType
  readonly direction: Direction
  constructor (
    readonly fontSize: number,
    readonly dark: boolean,
    readonly language: string,
    readonly emoji: string
  ) {
    this.variant = dark ? ThemeVariant.Dark : ThemeVariant.Light
    this.direction = getDirectionForLanguage(language)
  }
}
export const themeStore = writable<ThemeOptions>()

export function initThemeStore (): void {
  themeStore.set(
    new ThemeOptions(
      getCurrentFontSize() === 'normal-font' ? 16 : 14,
      isThemeDark(getCurrentTheme()),
      getCurrentLanguage(),
      getCurrentEmoji()
    )
  )
}

export const languageStore = derived(themeStore, ($theme) => $theme?.language ?? '')
export const directionStore = derived(themeStore, ($theme): Direction => $theme?.direction ?? 'ltr')
