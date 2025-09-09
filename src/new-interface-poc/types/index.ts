import type { ComputedRef, Ref } from "@vue/reactivity"
import type { IsArray, IsPlainObject } from "./utils"

export type InputControl<T> = {
  state: Ref<T | undefined>
  defaultValue: ComputedRef<T | undefined>
  dirty: ComputedRef<boolean>
  clear: () => void
  reset: () => void
  updateDefaultValue: (newDefaultValue: T) => void
  // .. all other input metadata
}

export type FormControl<T> = {
  controlsTree: FormNode<T>
  // .. all other root form api (validate, submit, etc..)
}

type PrimitiveFormNode<T> = {
  control: InputControl<T> // maybe could be turned to control() to differentiate from the other properties..?
}

type ObjectFormNode<T extends object> = PrimitiveFormNode<T> & {
  [Key in keyof T]: FormNode<T[Key]>
}

type ArrayFormNode<T extends unknown[]> = PrimitiveFormNode<T> & {
  [index: number]: FormNode<T[number]>
  [Symbol.iterator](): IterableIterator<FormNode<T[number]>>
}

export type FormNode<T> = IsPlainObject<T> extends true
  ? ObjectFormNode<T & object>
  : IsArray<T> extends true
  ? ArrayFormNode<T & unknown[]>
  : PrimitiveFormNode<T>
