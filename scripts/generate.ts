import path from 'node:path'
import fsp from 'node:fs/promises'
import { ShikiMap } from '../src/types'

const entries = (obj: any) => Object.entries(obj ?? {})
const values = (obj: any) => Object.values(obj ?? {})

// Modify this line
const PREFIX = 's'

async function generateOne(themePath: string) {
  const shikiMap: ShikiMap = {}
  let count = 0
  const getClass = () => {
    const className = PREFIX + count
    count++
    return className
  }

  function addValue(color: string) {
    if (typeof color !== 'string') {
      return
    }
    color = color.toLowerCase()
    if (shikiMap[color]) {
      return
    }
    shikiMap[color] = getClass()
  }

  const text = await fsp.readFile(themePath, 'utf-8')
  const json = JSON.parse(text)
  for (const token of json.tokenColors) {
    const { foreground } = token.settings ?? {}
    if (foreground) {
      addValue(foreground as string)
    }
  }
  for (const value of values(json.semanticTokenColors)) {
    addValue(value as string)
  }
  return shikiMap
}

function generateCss(obj: ShikiMap) {
  let style = ''
  for (const [value, key] of entries(obj)) {
    style += `.${key} {
  color: ${value};
}
`
  }
  return style
}

async function generate() {
  const themeDirPath = path.join(
    process.cwd(),
    'node_modules',
    'tm-themes',
    'themes',
  )
  const themeNames = await fsp.readdir(themeDirPath)

  await Promise.all(
    themeNames.map(async (name) => {
      const themePath = path.join(themeDirPath, name)
      const map = await generateOne(themePath)
      const baseName = name.replace('.json', '')
      const css = generateCss(map)
      const writeDirPath = path.join(process.cwd(), 'src', 'themes')
      await fsp.writeFile(path.join(writeDirPath, name), JSON.stringify(map))
      await fsp.writeFile(path.join(writeDirPath, `${baseName}.css`), css)
    }),
  )
}

generate()
