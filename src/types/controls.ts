import type { ComputedRef, Ref } from "@vue/reactivity"
import type { PartialOrPrimitive } from "./utils"

export type InputControl<T> = {
  state: Ref<PartialOrPrimitive<T> | undefined>
  defaultValue: ComputedRef<PartialOrPrimitive<T> | undefined>
  dirty: ComputedRef<boolean>
  isValid: ComputedRef<boolean>
  errorMessage: ComputedRef<string | undefined>
  clear: () => void
  reset: () => void
  updateDefaultValue: (newDefaultValue?: PartialOrPrimitive<T>) => void
}

export type ArrayInputControl<T extends Array<unknown>> = InputControl<T> & {
  add: (defaultValue?: PartialOrPrimitive<T[number]>) => void
  remove: (index: number) => void
  moveItem: (fromIndex: number, toIndex: number) => void
}
