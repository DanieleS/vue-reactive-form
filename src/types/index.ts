import type { ComputedRef, Ref } from "@vue/reactivity"
import type { IsArray, IsPlainObject, PartialOrPrimitive } from "./utils"

export type InputControl<T> = {
  state: Ref<T | undefined>
  defaultValue: ComputedRef<T | undefined>
  dirty: ComputedRef<boolean>
  clear: () => void
  reset: () => void
  updateDefaultValue: (newDefaultValue: T) => void
}

export type ArrayInputControl<T extends Array<unknown>> = InputControl<T> & {
  add: (defaultValue?: PartialOrPrimitive<T[number]>) => void
  remove: (index: number) => void
  moveItem: (fromIndex: number, toIndex: number) => void
}

export type PrimitiveFormNode<T> = {
  control: InputControl<T>
}

export type ObjectFormNode<T extends object> = PrimitiveFormNode<T> & {
  [Key in keyof T]: FormNode<T[Key]>
}

export type ArrayFormNode<T extends unknown[]> = {
  [index: number]: FormNode<T[number]>
  [Symbol.iterator](): IterableIterator<FormNode<T[number]>>
  control: ArrayInputControl<T>
}

export type FormNode<T> = IsPlainObject<T> extends true
  ? ObjectFormNode<T & object>
  : IsArray<T> extends true
  ? ArrayFormNode<T & unknown[]>
  : PrimitiveFormNode<T>

export type FormRoot<T> = {
  controlsTree: FormNode<T>
}
