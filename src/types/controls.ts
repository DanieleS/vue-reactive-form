import type { ComputedRef, Ref } from "@vue/reactivity"
import type { PartialOrPrimitive } from "./utils"

export type InputControl<T> = {
  state: Ref<T | undefined>
  defaultValue: ComputedRef<T | undefined>
  dirty: ComputedRef<boolean>
  isValid: ComputedRef<boolean>
  errorMessage: ComputedRef<string | undefined>
  clear: () => void
  reset: () => void
  updateDefaultValue: (newDefaultValue?: T) => void
}

export type ArrayInputControl<T extends Array<unknown>> = InputControl<T> & {
  add: (defaultValue?: PartialOrPrimitive<T[number]>) => void
  remove: (index: number) => void
  moveItem: (fromIndex: number, toIndex: number) => void
}
