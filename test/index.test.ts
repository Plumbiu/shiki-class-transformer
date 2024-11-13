import fsp from 'node:fs/promises'
import path from 'node:path'
import { codeToHtml } from 'shiki'
import { JSDOM } from 'jsdom'
import rgb2Hex from 'rgb-hex'
import { expect, test } from 'vitest'
import { shikiClassTransformer } from 'src'

function rgbHex(color: string) {
  if (color[0] === '#') {
    return color
  }
  return rgb2Hex(color)
}

async function run(p: string, lang: string) {
  const cwd = process.cwd()
  const themes = await fsp.readdir(
    path.join(cwd, 'node_modules/tm-themes/themes'),
  )
  await Promise.all(
    themes.map(async (theme) => {
      const raw = await fsp.readFile(
        path.join(cwd, 'src', 'themes', theme),
        'utf-8',
      )
      const map = JSON.parse(raw)
      const code = await fsp.readFile(path.join(cwd, p), 'utf-8')
      const options = {
        lang,
        theme: 'vitesse-light',
      }
      const htmlWithTransformer = await codeToHtml(code, {
        ...options,
        transformers: [shikiClassTransformer({ map })],
      })

      const html = await codeToHtml(code, options)
      const domWidthTransformer = new JSDOM(htmlWithTransformer)
      const dom = new JSDOM(html)

      const spansWithTransformer =
        domWidthTransformer.window.document.querySelectorAll('span')
      const spans = dom.window.document.querySelectorAll('span')

      for (let i = 0; i < spans.length; i++) {
        const span = spans[i]
        const spanWithTransformer = spansWithTransformer[i]
        const color = span.style.getPropertyValue('color')
        if (color) {
          const hex = rgbHex(color).toLowerCase()
          const className = spanWithTransformer.className
          // @ts-ignore
          const classNameWithTransformer = map['#' + hex]
          if (className) {
            // if className is not falsy, then style.color is deleted
            expect(
              spanWithTransformer.style.getPropertyValue('color'),
            ).toBeFalsy()
            // className should equal to classNameWithTransformer
            expect(className).toBe(classNameWithTransformer)
          }
        }
      }
    }),
  )
}

test('js', async () => {
  await run('node_modules/jsdom/lib/api.js', 'js')
})

test('json', async () => {
  await run('node_modules/tm-themes/themes/vitesse-light.json', 'js')
})

test('markdown', async () => {
  await run('node_modules/jsdom/README.md', 'markdown')
})

test('ts', async () => {
  await run('node_modules/vite/types/import-meta.d.ts', 'ts')
})
