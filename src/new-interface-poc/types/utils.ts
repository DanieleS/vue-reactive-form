// lightweight set of non-plain "builtin" object types to exclude
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-explicit-any
type NotPlain = Function | readonly any[] | Date | RegExp | Error | Promise<any>

// union of the members of T that are considered plain objects
type PlainMembers<T> = T extends object
  ? T extends NotPlain
    ? never
    : T
  : never

// true iff every member of T is a plain object
export type IsPlainObject<T> = [Exclude<T, PlainMembers<T>>] extends [never]
  ? true
  : false

export type IsArray<T> = T extends unknown[] ? true : false
