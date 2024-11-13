import fsp from 'node:fs/promises'
import path from 'node:path'
import { readdirSync, readFileSync } from 'node:fs'
import { codeToHtml } from 'shiki/bundle-full.mjs'
import { JSDOM } from 'jsdom'
import { expect, test, describe } from 'vitest'
import { colord } from 'colord'
import { shikiClassTransformer } from 'src'
import { parseNormalHexColor } from 'scripts/utils'
import { revertObject } from './utils'

const CWD = process.cwd()

const TM_THEMES = readdirSync(path.join(CWD, 'node_modules/tm-themes/themes'))

const CODE_JS = readFileSync('node_modules/jsdom/lib/api.js', 'utf-8')
const CODE_JSON = readFileSync(
  'node_modules/tm-themes/themes/vitesse-light.json',
  'utf-8',
)
const CODE_MARKDOWN = readFileSync('node_modules/jsdom/README.md', 'utf-8')
const CODE_TS = readFileSync(
  'node_modules/vite/types/import-meta.d.ts',
  'utf-8',
)

type CodeToHtmlOptions = Parameters<typeof codeToHtml>[1]

async function getDoms(code: string, options: CodeToHtmlOptions) {
  const html = await codeToHtml(code, options)
  const dom = new JSDOM(html)

  return dom
}

async function run(
  code: string,
  shikiOptions: Omit<CodeToHtmlOptions, 'theme'>,
) {
  await Promise.all(
    TM_THEMES.map(async (theme) => {
      const raw = await fsp.readFile(
        path.join(CWD, 'src', 'themes', theme),
        'utf-8',
      )
      const map = JSON.parse(raw)

      theme = theme.replace('.json', '')
      const domWidthTransformer = await getDoms(code, {
        ...shikiOptions,
        theme,
        transformers: [shikiClassTransformer({ map })],
      })
      const dom = await getDoms(code, { ...shikiOptions, theme })

      const spansWithTransformer =
        domWidthTransformer.window.document.querySelectorAll('span')
      const spans = dom.window.document.querySelectorAll('span')

      for (let i = 0; i < spans.length; i++) {
        const span = spans[i]
        const spanWithTransformer = spansWithTransformer[i]
        const color = span.style.getPropertyValue('color')
        if (color) {
          const hex = parseNormalHexColor(color)
          const className = spanWithTransformer.className
          // @ts-ignore
          const classNameWithTransformer = map[hex]
          if (className) {
            // revert map to { [ClassName]: HexColor }
            const classNameMap = revertObject(map)
            const hexWithTransformer = classNameMap[className]
            // if className is not falsy, then style.color is deleted
            expect(
              spanWithTransformer.style.getPropertyValue('color'),
            ).toBeFalsy()
            // className should equal to classNameWithTransformer
            expect(colord(hex).isEqual(hexWithTransformer)).toBe(true)
          }
        }
      }
    }),
  )
}

describe('basic lang', () => {
  test('js', async () => {
    await run(CODE_JS, { lang: 'js' })
  })

  test('json', async () => {
    await run(CODE_JSON, { lang: 'json' })
  })

  test('markdown', async () => {
    await run(CODE_MARKDOWN, { lang: 'markdown' })
  })

  test('ts', async () => {
    await run(CODE_TS, { lang: 'ts' })
  })
})
