import { type ShikiTransformer } from '@shikijs/types'
import { ShikiMap } from './types'

interface ShikiClassTransformerParams {
  map: ShikiMap

  /**
   * the select key of color, set dev to `true` if you want to know what the key really is
   * @default 'color'
   */
  key?: string
}

function isString(x: unknown): x is string {
  return typeof x === 'string'
}

export function shikiClassTransformer({
  map,
  key = 'color',
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
          const className = map[foreground]
          if (className) {
            if (!token.htmlAttrs) {
              token.htmlAttrs = {}
            }
            let originClassName = token.htmlAttrs.class ?? ''
            originClassName += ` ${className}`
            token.htmlStyle = {}
            token.htmlAttrs.class = originClassName.trim()
          }
        }
      }
    },
  }
}
