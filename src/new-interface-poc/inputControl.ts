import { computed, type Ref } from "@vue/reactivity"
import type { Object } from "ts-toolbelt"
import type { InputControl } from "./types"
import { get, isEqual, set } from "lodash-es"
import { deepPick } from "./utils"

const createInputControl = <T>(
  formState: Ref<Object.Partial<object, "deep">>,
  defaultFormState: Ref<Object.Partial<object, "deep">>,
  path: (string | number | symbol)[]
): InputControl<T> => {
  // Updating the default value should be discouraged, so it's exposed as a read-only computed
  const defaultValue = computed(() => get(defaultFormState.value, path))
  const state = computed({
    get() {
      return get(formState.value, path)
    },
    set(value: T) {
      set(formState.value, path, value)
    }
  })

  /**
   * Check if the form is dirty
   * We are filtering both inputs of possibly undefined values to avoid false positives, that might occur
   * when some property is not defined in some cases, and there but with value of `undefined` in some others
   */
  const dirty = computed(
    () =>
      !isEqual(
        deepPick(state.value, (v) => v !== undefined),
        deepPick(defaultValue.value, (v) => v !== undefined)
      )
  )

  const clear = () => {
    set(formState.value, path, undefined)
  }
  const reset = () => {
    state.value = defaultValue.value
  }
  const updateDefaultValue = (newDefaultValue: T) => {
    set(defaultFormState.value, path, newDefaultValue)
  }

  return {
    defaultValue,
    state,
    dirty,
    clear,
    reset,
    updateDefaultValue
  }
}

export const getInputControl = (
  formState: Ref<Object.Partial<object, "deep">>,
  defaultFormState: Ref<Object.Partial<object, "deep">>,
  controlsCache: Map<string, InputControl<unknown>>,
  path: (string | number | symbol)[]
) => {
  const concatenatedPath: string = path.join(".")

  if (!controlsCache.has(concatenatedPath)) {
    controlsCache.set(
      concatenatedPath,
      createInputControl(formState, defaultFormState, path)
    )
  }

  return controlsCache.get(concatenatedPath)
}
