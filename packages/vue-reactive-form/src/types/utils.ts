import type { Object } from "ts-toolbelt"

// Lightweight set of non-plain-types "builtin" object types to exclude
export interface NotPlainTypes {
  // Library’s defaults
  types: Function | readonly any[] | Date | RegExp | Error | Promise<any>
}

type NotPlain = NotPlainTypes["types"]

// True if every member of T is a plain object
export type IsPlainObject<T> = T extends object
  ? T extends NotPlain
    ? false
    : true
  : false

export type IsArray<T> = T extends unknown[] ? true : false

export type PartialOrPrimitive<T> = T extends object
  ? Object.Partial<T, "deep">
  : T

export type RequiredOrPrimitive<T> = T extends object
  ? Object.Required<T, keyof T, "deep">
  : T
