import type { Ref } from "@vue/reactivity"
import { createInputControl } from "./inputControl"
import type { ArrayInputControl } from "./types"
import type { PartialOrPrimitive } from "./types/utils"

export const createArrayInputControl = <TState extends Array<unknown>>(
  formState: Ref<unknown>,
  defaultFormState: Ref<unknown>,
  path: (string | number | symbol)[] = []
): ArrayInputControl<TState> => {
  const inputControl = createInputControl<TState>(
    formState,
    defaultFormState,
    path
  )

  const add = (defaultValue?: PartialOrPrimitive<TState[number]>) => {
    if (!inputControl.state.value) {
      inputControl.state.value = [] as unknown as TState
    }
    inputControl.state.value?.push(defaultValue)
  }

  const remove = (index: number) => {
    inputControl.state.value?.splice(index, 1)
  }

  const moveItem = (fromIndex: number, toIndex: number) => {
    // Clamp indices to array bounds
    const maxIndex = (inputControl.state.value ?? []).length - 1
    const start = Math.max(0, Math.min(maxIndex, fromIndex))
    const end = Math.max(0, Math.min(maxIndex, toIndex))

    // Remove the item
    const [item] = (inputControl.state.value ?? []).splice(start, 1)

    // Insert the item at the new position
    inputControl.state.value?.splice(end, 0, item)
  }

  return {
    ...inputControl,
    add,
    remove,
    moveItem
  }
}
