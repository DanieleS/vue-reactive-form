import { createInputControl } from "./inputControl"
import type { PartialOrPrimitive } from "./types/utils"
import type { ArrayInputControl } from "./types/controls"
import type { FormContext } from "./types/useForm"

export const createArrayInputControl = <TState extends Array<unknown>>(
  context: FormContext<unknown>,
  path: (string | number | symbol)[] = []
): ArrayInputControl<TState> => {
  const inputControl = createInputControl<TState>(context, path)

  const add = (defaultValue?: PartialOrPrimitive<TState[number]>) => {
    if (!inputControl.state.value) {
      inputControl.state.value = [] as unknown as PartialOrPrimitive<TState>
    }
    inputControl.state.value?.push(defaultValue as any)
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
