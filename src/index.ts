import { type ShikiTransformer } from '@shikijs/types'
import { ShikiMap } from './types'

interface ShikiClassTransformerParams {

  /**
   * Better use the light theme
   */
  map: ShikiMap

  /**
   * the select key of color, set dev to `true` if you want to know what the key really is
   * @default 'color'
   */
  key?: string

  /**
   * set `true` will log the `htmlStyle`
   * @default false
   */
  dev?: boolean
}

function isString(x: unknown): x is string {
  return typeof x === 'string'
}

export function shikiClassTransformer({
  map,
  key = 'color',
  dev = false,
}: ShikiClassTransformerParams): ShikiTransformer {
  return {
    tokens(tokens) {
      for (const items of tokens) {
        for (const token of items) {
          const htmlStyle = token.htmlStyle
          if (!htmlStyle || isString(htmlStyle)) {
            continue
          }
          const foreground = htmlStyle[key]?.toLowerCase()
          if (!foreground) {
            return
          }
          if (!token.htmlAttrs) {
            token.htmlAttrs = {}
          }
          token.htmlStyle = {}
          let originClassName = token.htmlAttrs.class ?? ''
          if (dev) {
            console.log(htmlStyle)
          }
          const className = map[foreground]
          if (className) {
            originClassName += ` ${className}`
          }
          token.htmlAttrs.class = originClassName.trim()
        }
      }
    },
  }
}
