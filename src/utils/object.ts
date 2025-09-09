import { isDate } from "date-fns"
import set from "lodash/set"

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

        if (typeof value === "object" && value !== null && !isDate(value)) {
          recurse(value, newPath)
        } else if (condition(value, key)) {
          set(result, newPath, value)
        }
      }
    }
  }

  recurse(obj, [])
  return result
}
