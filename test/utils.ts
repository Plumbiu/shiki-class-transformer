export function revertObject(obj: Object) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key]),
  )
}
