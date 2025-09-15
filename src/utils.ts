import { isDate, isEqual, set } from "lodash-es"

export const deepPick = (
  obj: any,
  condition: (value: any, key: string) => boolean
) => {
  const result: any = Array.isArray(obj) ? [] : {}

  const recurse = (current: any, path: string[]) => {
    if (typeof current !== "object" || current === null) {
      return
    }

    for (const key in current) {
      if (current.hasOwnProperty(key)) {
        const value = current[key]
        const newPath = path.concat(key)

        if (Array.isArray(current)) {
          // Special handling for arrays: preserve indexes even if value is undefined
          if (condition(value, key) || value === undefined) {
            set(result, newPath, value)
          }
          recurse(value, newPath)
        } else if (
          typeof value === "object" &&
          value !== null &&
          !isDate(value)
        ) {
          if (isEqual(value, {}) || isEqual(value, [])) {
            // If the object is empty, we still want to include it
            set(result, newPath, value)
          } else {
            recurse(value, newPath)
          }
        } else if (condition(value, key)) {
          set(result, newPath, value)
        }
      }
    }
  }

  recurse(obj, [])
  return result
}
