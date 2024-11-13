import { type ShikiTransformer } from '@shikijs/types'
import parse from 'style-to-object'
import { ShikiMap } from './types'

interface ShikiClassTransformerParams {
  map: ShikiMap

  /**
   * the select key of color, set dev to `true` if you want to know what the key really is
   * @default ['color']
   */
  keys?: string[]
}

function isString(x: unknown): x is string {
  return typeof x === 'string'
}

export function shikiClassTransformer({
  map,
  keys = ['color'],
}: ShikiClassTransformerParams): ShikiTransformer {
  return {
    tokens(tokens) {
      for (const items of tokens) {
        for (const token of items) {
          const hasHtmlStyle = !!token.htmlStyle
          let htmlStyle = token.htmlStyle ?? (token as any)
          if (isString(htmlStyle)) {
            htmlStyle = parse(htmlStyle) ?? {}
          }
          for (const key of keys) {
            const foreground = htmlStyle[key]?.toLowerCase()
            if (!foreground) {
              continue
            }
            const className = map[foreground]
            if (!className) {
              continue
            }

            if (!token.htmlAttrs) {
              token.htmlAttrs = {}
            }
            if (!hasHtmlStyle) {
              // @ts-ignore
              delete token[key]
            } else {
              token.htmlStyle = {}
            }

            let originClassName = token.htmlAttrs.class ?? ''
            originClassName += ` ${className}`
            const afterClassName = originClassName.trim()
            if (afterClassName) {
              token.htmlAttrs.class = afterClassName
            }
          }
        }
      }
    },
  }
}
