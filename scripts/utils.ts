import { colord } from 'colord'

export function isShortHexColor(color: string) {
  const len = color.length
  return len === 3 || len === 4
}

export function parseNormalHexColor(color: string) {
  if (color[0] !== '#' || isShortHexColor(color)) {
    color = colord(color).toHex()
  }
  return color.toLowerCase()
}
